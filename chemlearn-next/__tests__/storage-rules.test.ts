import fs from 'fs';
import path from 'path';

describe('Firebase Storage Security Rules Verification', () => {
  const rootStorageRulesPath = path.resolve(__dirname, '../../storage.rules');
  const nextStorageRulesPath = path.resolve(__dirname, '../storage.rules');

  let rootRules: string;
  let nextRules: string;

  beforeAll(() => {
    rootRules = fs.readFileSync(rootStorageRulesPath, 'utf8');
    nextRules = fs.readFileSync(nextStorageRulesPath, 'utf8');
  });

  describe('Storage Rules Parity & Structural Lockdown', () => {
    it('ensures root and chemlearn-next storage.rules are synchronized', () => {
      expect(rootRules.replace(/\r\n/g, '\n')).toBe(nextRules.replace(/\r\n/g, '\n'));
    });

    it('denies root access by default', () => {
      expect(rootRules).toContain('match /{allPaths=**}');
      expect(rootRules).toContain('allow read, write: if false;');
    });

    it('locks private user uploads to owner and admin only (no global teacher read bypass)', () => {
      expect(rootRules).toContain('match /users/{userId}/{allPaths=**}');
      expect(rootRules).toContain('allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);');
      expect(rootRules).not.toContain("request.auth.token.role == 'teacher'");
      expect(rootRules).not.toContain('request.auth.token.teacher == true');
    });

    it('enforces safe delete permissions without evaluating null request.resource', () => {
      expect(rootRules).toContain('allow delete: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);');
      expect(rootRules).toContain('allow create, update:');
    });

    it('enforces 5MB limit and strict image MIME type validation', () => {
      expect(rootRules).toContain('request.resource.size < 5 * 1024 * 1024');
      expect(rootRules).toContain("request.resource.contentType.matches('image/(jpeg|jpg|png|webp|gif)')");
    });

    it('protects public curriculum directory (read-only for all, write for admin)', () => {
      expect(rootRules).toContain('match /public/{allPaths=**}');
      expect(rootRules).toContain('allow read: if true;');
      expect(rootRules).toContain('allow write: if request.auth != null && request.auth.token.admin == true;');
    });
  });

  describe('Storage Rule Logic Emulation (Negative & Boundary Tests)', () => {
    interface StorageAuthContext {
      uid: string;
      token?: { admin?: boolean; role?: string; teacher?: boolean };
    }

    interface StorageFileResource {
      size: number;
      contentType: string;
    }

    function evaluateStorageRead(auth: StorageAuthContext | null, targetUserId: string): boolean {
      if (!auth) return false;
      return auth.uid === targetUserId || auth.token?.admin === true;
    }

    function evaluateStorageWrite(
      op: 'create' | 'update' | 'delete',
      auth: StorageAuthContext | null,
      targetUserId: string,
      resource: StorageFileResource | null
    ): boolean {
      if (!auth) return false;
      if (op === 'delete') {
        return auth.uid === targetUserId || auth.token?.admin === true;
      }
      if (auth.uid !== targetUserId) return false;
      if (!resource) return false;
      if (resource.size >= 5 * 1024 * 1024) return false;
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      return validTypes.includes(resource.contentType);
    }

    it('DENIES unauthenticated reads to private user files', () => {
      expect(evaluateStorageRead(null, 'student_123')).toBe(false);
    });

    it('DENIES teacher or third-party student reading another student files', () => {
      const otherStudent: StorageAuthContext = { uid: 'student_999' };
      const teacherAuth: StorageAuthContext = { uid: 'teacher_456', token: { role: 'teacher', teacher: true } };

      expect(evaluateStorageRead(otherStudent, 'student_123')).toBe(false);
      expect(evaluateStorageRead(teacherAuth, 'student_123')).toBe(false);
    });

    it('ALLOWS owner and admin reading private user files', () => {
      const ownerAuth: StorageAuthContext = { uid: 'student_123' };
      const adminAuth: StorageAuthContext = { uid: 'admin_001', token: { admin: true } };

      expect(evaluateStorageRead(ownerAuth, 'student_123')).toBe(true);
      expect(evaluateStorageRead(adminAuth, 'student_123')).toBe(true);
    });

    it('ALLOWS owner to safely delete their own files when resource is null', () => {
      const ownerAuth: StorageAuthContext = { uid: 'student_123' };
      expect(evaluateStorageWrite('delete', ownerAuth, 'student_123', null)).toBe(true);
    });

    it('DENIES non-owner from deleting files', () => {
      const attackerAuth: StorageAuthContext = { uid: 'attacker_666' };
      expect(evaluateStorageWrite('delete', attackerAuth, 'student_123', null)).toBe(false);
    });

    it('DENIES uploads exceeding 5MB', () => {
      const ownerAuth: StorageAuthContext = { uid: 'student_123' };
      const oversizedFile: StorageFileResource = { size: 6 * 1024 * 1024, contentType: 'image/png' };
      expect(evaluateStorageWrite('create', ownerAuth, 'student_123', oversizedFile)).toBe(false);
    });

    it('DENIES uploads with executable, PDF, or SVG MIME types', () => {
      const ownerAuth: StorageAuthContext = { uid: 'student_123' };
      const svgFile: StorageFileResource = { size: 1024, contentType: 'image/svg+xml' };
      const exeFile: StorageFileResource = { size: 1024, contentType: 'application/x-msdownload' };
      const pdfFile: StorageFileResource = { size: 1024, contentType: 'application/pdf' };

      expect(evaluateStorageWrite('create', ownerAuth, 'student_123', svgFile)).toBe(false);
      expect(evaluateStorageWrite('create', ownerAuth, 'student_123', exeFile)).toBe(false);
      expect(evaluateStorageWrite('create', ownerAuth, 'student_123', pdfFile)).toBe(false);
    });

    it('ALLOWS valid image upload within 5MB limit', () => {
      const ownerAuth: StorageAuthContext = { uid: 'student_123' };
      const validPng: StorageFileResource = { size: 2 * 1024 * 1024, contentType: 'image/png' };
      const validJpeg: StorageFileResource = { size: 1.5 * 1024 * 1024, contentType: 'image/jpeg' };

      expect(evaluateStorageWrite('create', ownerAuth, 'student_123', validPng)).toBe(true);
      expect(evaluateStorageWrite('create', ownerAuth, 'student_123', validJpeg)).toBe(true);
    });
  });
});
