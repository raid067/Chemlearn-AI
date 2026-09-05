import { useGamificationStore } from '@/stores/useGamificationStore';

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('Gamification Store (State Machine & Level Boundaries)', () => {
  beforeEach(() => {
    useGamificationStore.setState({
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      levelUpModalTrigger: false,
    });
  });

  it('initializes with default zeroed state', () => {
    const state = useGamificationStore.getState();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.badges).toEqual([]);
    expect(state.levelUpModalTrigger).toBe(false);
  });

  it('increments streak sequentially', () => {
    useGamificationStore.getState().incrementStreak();
    expect(useGamificationStore.getState().streak).toBe(1);
    useGamificationStore.getState().incrementStreak();
    expect(useGamificationStore.getState().streak).toBe(2);
  });

  it('prevents duplicate badge additions', () => {
    const badge = { id: 'first_quiz', emoji: '🏆', label: 'First Quiz' };
    useGamificationStore.getState().unlockBadge(badge);
    expect(useGamificationStore.getState().badges.length).toBe(1);

    // Add duplicate badge
    useGamificationStore.getState().unlockBadge(badge);
    expect(useGamificationStore.getState().badges.length).toBe(1);

    // Add different badge
    const badge2 = { id: 'streak_3', emoji: '🔥', label: '3-Day Streak' };
    useGamificationStore.getState().unlockBadge(badge2);
    expect(useGamificationStore.getState().badges.length).toBe(2);
  });

  it('calculates level boundaries correctly and triggers level-up modal', async () => {
    // 0 to 499 XP -> Level 1
    await useGamificationStore.getState().addXP(400, 'Lesson progress');
    expect(useGamificationStore.getState().xp).toBe(400);
    expect(useGamificationStore.getState().level).toBe(1);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(false);

    // Crossing 500 XP -> Level 2 (triggers modal)
    await useGamificationStore.getState().addXP(100, 'Quiz completed');
    expect(useGamificationStore.getState().xp).toBe(500);
    expect(useGamificationStore.getState().level).toBe(2);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(true);

    // Dismiss level-up modal
    useGamificationStore.getState().dismissLevelUp();
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(false);

    // Crossing 1200 XP -> Level 3
    await useGamificationStore.getState().addXP(700, 'Challenge completed');
    expect(useGamificationStore.getState().xp).toBe(1200);
    expect(useGamificationStore.getState().level).toBe(3);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(true);

    useGamificationStore.getState().dismissLevelUp();

    // Crossing 2200 XP -> Level 4
    await useGamificationStore.getState().addXP(1000, 'Hard lesson');
    expect(useGamificationStore.getState().xp).toBe(2200);
    expect(useGamificationStore.getState().level).toBe(4);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(true);

    useGamificationStore.getState().dismissLevelUp();

    // Crossing 3500 XP -> Level 5
    await useGamificationStore.getState().addXP(1300, 'Mastery review');
    expect(useGamificationStore.getState().xp).toBe(3500);
    expect(useGamificationStore.getState().level).toBe(5);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(true);

    useGamificationStore.getState().dismissLevelUp();

    // Crossing 5000 XP -> Level 6
    await useGamificationStore.getState().addXP(1500, 'Lab Specialist');
    expect(useGamificationStore.getState().xp).toBe(5000);
    expect(useGamificationStore.getState().level).toBe(6);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(true);

    useGamificationStore.getState().dismissLevelUp();

    // Crossing 14000 XP -> Level 10
    await useGamificationStore.getState().addXP(9000, 'Grand Chemist');
    expect(useGamificationStore.getState().xp).toBe(14000);
    expect(useGamificationStore.getState().level).toBe(10);
    expect(useGamificationStore.getState().levelUpModalTrigger).toBe(true);
  });
});