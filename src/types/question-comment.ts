export type CommentProfileType = 'student' | 'teacher';

export interface QuestionCommentUser {
  id: string;
  name: string;
  typeProfile: CommentProfileType;
  isQuestionCreator: boolean;
  avatarUrl: string | null;
}

export interface QuestionCommentImage {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface QuestionCommentMention {
  id: string;
  name: string;
}

export interface QuestionComment {
  id: string;
  questionId: string;
  parentId: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  isAuthor: boolean;
  canEdit: boolean;
  canDelete: boolean;
  user: QuestionCommentUser | null;
  images: QuestionCommentImage[];
  mentions: QuestionCommentMention[];
  replies: QuestionComment[];
}

export interface QuestionCommentList {
  count: number;
  items: QuestionComment[];
}
