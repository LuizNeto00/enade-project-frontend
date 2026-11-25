import { api } from '@/boot/axios';
import type { QuestionComment, QuestionCommentList } from '@/types/question-comment';
import type { CommentProfileType } from '@/types/question-comment';

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function getCommentAuthorAvatar(token: string, questionId: string, authorId: string) {
  return (
    await api.get<Blob>(
      `/question/${encodeURIComponent(questionId)}/comments/authors/${encodeURIComponent(authorId)}/avatar`,
      { headers: headers(token), responseType: 'blob' },
    )
  ).data;
}

export async function listQuestionComments(token: string, questionId: string) {
  return (
    await api.get<QuestionCommentList>(`/question/${encodeURIComponent(questionId)}/comments`, {
      headers: headers(token),
    })
  ).data;
}

export async function createQuestionComment(
  token: string,
  questionId: string,
  content: string,
  images: File[],
  parentId?: string,
  mentionedUserIds: string[] = [],
) {
  const data = new FormData();
  if (content.trim()) data.append('content', content.trim());
  if (parentId) data.append('parentId', parentId);
  for (const id of mentionedUserIds) data.append('mentionedUserIds', id);
  images.forEach((image) => data.append('images', image));
  return (
    await api.post<QuestionComment>(`/question/${encodeURIComponent(questionId)}/comments`, data, {
      headers: headers(token),
      timeout: 120000,
    })
  ).data;
}

export async function updateQuestionComment(
  token: string,
  questionId: string,
  commentId: string,
  content: string,
  images: File[],
  removeImageIds: string[] = [],
) {
  const data = new FormData();
  data.append('content', content.trim());
  if (removeImageIds.length) data.append('removeImageIds', removeImageIds.join(','));
  images.forEach((image) => data.append('images', image));
  return (
    await api.patch<QuestionComment>(
      `/question/${encodeURIComponent(questionId)}/comments/${encodeURIComponent(commentId)}`,
      data,
      { headers: headers(token), timeout: 120000 },
    )
  ).data;
}

export async function deleteQuestionComment(token: string, questionId: string, commentId: string) {
  await api.delete(
    `/question/${encodeURIComponent(questionId)}/comments/${encodeURIComponent(commentId)}`,
    {
      headers: headers(token),
    },
  );
}

export async function searchCommentMentionUsers(token: string, questionId: string, search: string) {
  return (
    await api.get<Array<{ id: string; name: string; typeProfile: CommentProfileType }>>(
      `/question/${encodeURIComponent(questionId)}/comments/mentions`,
      { headers: headers(token), params: { search } },
    )
  ).data;
}
