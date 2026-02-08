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
  <div class="flex flex-col h-full">
    <!-- Add comment input -->
    <div class="flex items-center gap-2 p-3 border-b border-[var(--surface-border)]">
      <span
        v-if="currentUser"
        class="flex items-center justify-center w-7 h-7 min-w-7 rounded-full text-white text-[10px] font-semibold select-none"
        :style="{ backgroundColor: getAvatarColor(currentUser.email) }"
      >
        {{ getInitialsFromUser(currentUser) }}
      </span>
      <input
        v-model="newCommentText"
        class="flex-1 border-none outline-none text-[13px] text-[var(--text-color)] bg-transparent py-1.5 placeholder:text-[var(--text-secondary)]"
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

    <div v-if="sortedComments.length === 0" class="flex items-center justify-center p-8 text-[var(--text-secondary)] text-[13px] italic">
      No comments yet
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="flex items-start gap-2.5 p-3 border-b border-[var(--surface-border)] transition-[background] duration-150"
        :class="{
          'cursor-pointer hover:bg-[var(--surface-hover,#f8fafc)]': !!comment.marker,
          'opacity-60': comment.isResolved
        }"
        @click="jumpToMarker(comment)"
      >
        <span
          class="flex items-center justify-center w-7 h-7 min-w-7 rounded-full text-white text-[10px] font-semibold select-none"
          :style="{ backgroundColor: getAvatarColor(comment.author.email) }"
        >
          {{ getInitialsFromUser(comment.author) }}
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 mb-0.5">
            <span class="text-[13px] font-semibold text-[var(--text-color)]">{{ getDisplayName(comment.author) }}</span>
            <span class="text-[11px] text-[var(--text-secondary)]">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="text-[13px] text-[var(--text-color)] m-0 leading-[1.4] break-words">{{ comment.comment }}</p>
          <span
            v-if="comment.marker"
            class="inline-block mt-1 text-[11px] text-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-1.5 py-px rounded"
          >
            Page {{ comment.marker.pageNumber }}
          </span>
        </div>
        <span v-if="comment.isResolved" class="flex items-center justify-center w-5 h-5 rounded-full bg-[#27ae60] text-white text-[10px] shrink-0 mt-0.5">
          <i class="pi pi-check"></i>
        </span>
      </div>
    </div>
  </div>
</template>
