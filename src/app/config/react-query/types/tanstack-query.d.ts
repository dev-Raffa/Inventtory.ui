import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      errorMessage?: string;
      successMessage?: string;
      suppressErrorToast?: boolean;
    };
  }
}
