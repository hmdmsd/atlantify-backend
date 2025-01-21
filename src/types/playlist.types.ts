export interface CreatePlaylistDTO {
    name: string;
    description?: string;
    isPublic?: boolean;
    songIds?: number[];
  }
  
  export interface UpdatePlaylistDTO {
    name?: string;
    description?: string;
    isPublic?: boolean;
    songIds?: number[];
  }