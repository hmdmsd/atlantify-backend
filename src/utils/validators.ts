interface SongInput {
  title: string;
  artist: string;
  path: string;
  size: number | string;
}

export const validateSongInput = (input: SongInput): string | null => {
  if (
    !input.title ||
    typeof input.title !== 'string' ||
    input.title.trim().length === 0
  ) {
    return 'Title is required';
  }

  if (
    !input.artist ||
    typeof input.artist !== 'string' ||
    input.artist.trim().length === 0
  ) {
    return 'Artist is required';
  }

  if (
    !input.path ||
    typeof input.path !== 'string' ||
    input.path.trim().length === 0
  ) {
    return 'Path is required';
  }

  if (!input.size || isNaN(Number(input.size)) || Number(input.size) <= 0) {
    return 'Valid file size is required';
  }

  return null;
};
