/**
 * Backward-compatible re-exports for DemoPage.
 * New code should import from `@/components/onboarding/SpotlightTour`.
 */
export {
  SpotlightTour as DemoTour,
  type SpotlightTourStep as DemoTourStep,
} from '@/components/onboarding/SpotlightTour';

export {
  isTourDone,
  markTourDone,
  resetDemoTours as resetAllDemoTours,
  TOUR_KEYS,
} from '@/components/onboarding/onboardingStorage';
