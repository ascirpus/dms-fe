<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue';
import type { Comment, User } from '@/types';
import { useComments } from '@/composables/useComments';
import { getAvatarColor, getInitialsFromUser, getDisplayName } from '@/utils/avatar';
import { Button } from 'primevue';

interface Props {
  projectId: string;
  documentId: string;
  fileId: string;
  fileVersion: number;
  currentUser?: User;
}

const props = defineProps<Props>();
const emit = defineEmits(['jump-to-marker']);

const { addComment } = useComments();
const comments = inject<Ref<Comment[]>>('comments')!;

const newCommentText = ref('');

const sortedComments = computed(() => {
  return [...comments.value]
    .filter(c => c.documentId === props.documentId && c.fileId === props.fileId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${day}.${month}.${year} ${hour12}:${minutes} ${ampm}`;
};

const jumpToMarker = (comment: Comment) => {
  if (comment.marker) {
    emit('jump-to-marker', comment.marker.pageNumber, comment.id);
  }
};

const submitComment = async () => {
  if (!newCommentText.value.trim()) return;
  try {
    await addComment(
      props.projectId,
      props.documentId,
      props.fileId,
      props.fileVersion,
      newCommentText.value,
      null,
    );
    newCommentText.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};
</script>

<template>
  <div class="comment-list">
    <!-- Add comment input -->
    <div class="add-comment">
      <span
        v-if="currentUser"
        class="comment-avatar"
        :style="{ backgroundColor: getAvatarColor(currentUser.email) }"
      >
        {{ getInitialsFromUser(currentUser) }}
      </span>
      <input
        v-model="newCommentText"
        class="comment-input"
        placeholder="Add a comment..."
        @keydown.enter="submitComment"
      />
      <Button
        icon="pi pi-send"
        text
        rounded
        size="small"
        @click="submitComment"
        :disabled="!newCommentText.trim()"
      />
    </div>

    <div v-if="sortedComments.length === 0" class="empty-state">
      No comments yet
    </div>

    <div v-else class="comments">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="comment-item"
        :class="{ 'has-marker': !!comment.marker, 'is-resolved': comment.isResolved }"
        @click="jumpToMarker(comment)"
      >
        <span
          class="comment-avatar"
          :style="{ backgroundColor: getAvatarColor(comment.author.email) }"
        >
          {{ getInitialsFromUser(comment.author) }}
        </span>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">{{ getDisplayName(comment.author) }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-text">{{ comment.comment }}</p>
          <span
            v-if="comment.marker"
            class="page-badge"
          >
            Page {{ comment.marker.pageNumber }}
          </span>
        </div>
        <span v-if="comment.isResolved" class="resolved-badge">
          <i class="pi pi-check"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.add-comment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--surface-border);
}

.comment-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-color);
  background: transparent;
  padding: 6px 0;
}

.comment-input::placeholder {
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--text-secondary);
  font-size: 13px;
  font-style: italic;
}

.comments {
  flex: 1;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--surface-border);
  transition: background 0.15s;
}

.comment-item.has-marker {
  cursor: pointer;
}

.comment-item.has-marker:hover {
  background: var(--surface-hover, #f8fafc);
}

.comment-item.is-resolved {
  opacity: 0.6;
}

.comment-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  font-weight: 600;
  user-select: none;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.comment-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.comment-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.comment-text {
  font-size: 13px;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.page-badge {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  padding: 1px 6px;
  border-radius: 4px;
}

.resolved-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #27ae60;
  color: white;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
