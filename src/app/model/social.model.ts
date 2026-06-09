export interface PostModel {
  id?: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  likes?: string[];
  createdAt?: string;
  comments?: CommentModel[]; // For frontend convenience
  showComments?: boolean;    // For UI toggle
  isExpanded?: boolean;      // For content truncation toggle
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatarUrl?: string;
  
}

export interface CommentModel {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatarUrl?: string;
}
