'use client';
import { useState, useEffect } from 'react';
import { Search, MoreVertical, FileDown, Loader2 } from 'lucide-react';
import { useTeacherStore } from '@/stores/useTeacherStore';
import { useUIStore } from '@/stores/useUIStore';
import { app } from '@/lib/firebase';
import { getFirestore, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { StudentData } from '@/types/student';
import { getLevelTitle } from '@/lib/utils';

export default function StudentRoster() {
  const { classes, selectedClassId } = useTeacherStore();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedClass = classes.find(c => c.id === selectedClassId);

  useEffect(() => {
    if (!selectedClass || !selectedClass.studentIds || selectedClass.studentIds.length === 0) {
      setTimeout(() => setStudents([]), 0);
      return;
    }

    let isMounted = true;
    
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const db = getFirestore(app);
        const studentData: StudentData[] = [];
        const studentIds = selectedClass.studentIds;
        
        // Firestore 'in' queries are limited to 30 items per chunk
        const chunkSize = 30;
        for (let i = 0; i < studentIds.length; i += chunkSize) {
          const chunk = studentIds.slice(i, i + chunkSize);
          const q = query(
            collection(db, 'students'),
            where(documentId(), 'in', chunk)
          );
          const snapshot = await getDocs(q);
          snapshot.forEach(d => {
            studentData.push({ uid: d.id, ...d.data() } as StudentData);
          });
        }
        
        if (isMounted) {
          // Sort by XP descending
          studentData.sort((a, b) => (b.xp || 0) - (a.xp || 0));
          setStudents(studentData);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudents();

    return () => { isMounted = false; };
  }, [selectedClass]);

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="font-bold text-lg text-slate-800">
            {selectedClass ? `${selectedClass.name} Roster` : 'Student Roster'}
          </h2>
          {selectedClass && (
            <p className="text-xs text-slate-500">{students.length} students enrolled</p>
          )}
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple text-sm"
            />
          </div>
          <button 
            onClick={() => useUIStore.getState().showToast("Exporting", "Student roster CSV is being generated.", "📥")}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        ) : null}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
              <th className="px-6 py-4 font-bold border-b border-slate-200">Student</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">Avg Score</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">Total XP</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">Streak</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
              <tr key={s.uid || i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{s.displayName || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">{s.email}</div>
                  <div className="text-[10px] font-bold text-brand-purple uppercase mt-1">
                    {getLevelTitle(s.quizScore || 0)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    (s.quizScore || 0) >= 80 ? 'bg-green-100 text-green-700' : 
                    (s.quizScore || 0) >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {s.quizScore || 0}%
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">{s.xp || 0}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{s.streak || 0} days</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => useUIStore.getState().showToast("Menu Opened", `Viewing options for ${s.displayName}`, "ℹ️")}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  {selectedClass ? 'No students found.' : 'Select or create a class to view students.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
