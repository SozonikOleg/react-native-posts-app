import { makeAutoObservable } from 'mobx';
import type { ScrollNewsPost } from '@/features/scroll-news/model/types';

export type ScrollNewsPostsFilterTab = 'all' | 'free' | 'paid';

export class ScrollNewsUiStore {
  activeTab: ScrollNewsPostsFilterTab = 'all';
  openedPost: ScrollNewsPost | null = null;
  selectedPostId: string | null = null;
  commentsNewestFirst = true;
  commentDraftByPostId = new Map<string, string>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setActiveTab(tab: ScrollNewsPostsFilterTab) {
    this.activeTab = tab;
  }

  openPost(post: ScrollNewsPost) {
    this.openedPost = post;
  }

  closePost() {
    this.openedPost = null;
  }

  toggleComments(postId: string) {
    if (this.selectedPostId === postId) {
      this.selectedPostId = null;
      this.commentsNewestFirst = true;
      return;
    }
    this.selectedPostId = postId;
    this.commentsNewestFirst = true;
  }

  setCommentsNewestFirst(value: boolean) {
    this.commentsNewestFirst = value;
  }

  getCommentDraft(postId: string) {
    return this.commentDraftByPostId.get(postId) ?? '';
  }

  setCommentDraft(postId: string, value: string) {
    this.commentDraftByPostId.set(postId, value);
  }

  clearCommentDraft(postId: string) {
    this.commentDraftByPostId.delete(postId);
  }
}

