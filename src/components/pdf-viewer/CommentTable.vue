<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue';
import type { Comment } from "@/types";
import { useMainStore } from "@/stores/mainStore.ts";
import { useComments } from "@/composables/useComments.ts";
import { Button, InputText, FloatLabel, Avatar } from "primevue";

interface Props {
  documentId: string;
  currentPage?: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['jump-to-marker']);

const appState = useMainStore();
const { addComment, resolveComment } = useComments();
const comments = inject<Ref<Comment[]>>('comments')!!.value;

const replyText = ref('');
const replyingToId = ref<string | null>(null);

// Group comments by their parent to build a tree structure
const commentTree = computed(() => {
  // Get all top-level comments (no parent)
  const rootComments = comments
      .filter(comment => !comment.parentId && comment.documentId === props.documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // For each root comment, find its children
  return rootComments.map(rootComment => {
    const replies = comments
        .filter(comment => comment.parentId === rootComment.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      ...rootComment,
      replies
    };
  });
});

// Filter comments by current page if provided
const visibleComments = computed(() => {
  if (!props.currentPage) {
    return commentTree.value;
  }

  return commentTree.value.filter(comment =>
      comment.marker?.pageNumber === props.currentPage
  );
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const startReply = (commentId: string) => {
  replyingToId.value = commentId;
  replyText.value = '';
};

const cancelReply = () => {
  replyingToId.value = null;
  replyText.value = '';
};

const submitReply = async (parentComment: Comment) => {
  if (!replyText.value.trim()) return;

  try {

    // Add reply comment (with parentId)
    addComment(
        props.documentId,
        replyText.value,
        null,
        parentComment.id
    );

    // Clear reply form
    cancelReply();
  } catch (error) {
    console.error('Error adding reply:', error);
  }
};

const jumpToMarker = (comment: Comment) => {
  if (comment.marker) {
    emit('jump-to-marker', comment.marker.pageNumber);
  }
};
</script>

<template>
  <div class="comment-list w-full mt-8">
    <h2 class="text-xl font-semibold mb-4">Comments</h2>

    <div v-if="visibleComments.length === 0" class="text-gray-500 italic">
      No comments{{ props.currentPage ? ' on this page' : '' }}
    </div>

    <div v-else class="space-y-4">
      <!-- Root comments with their replies -->
      <div v-for="comment in visibleComments" :key="comment.id" class="comment-thread">
        <!-- Parent comment -->
        <div class="comment-card bg-white rounded-lg shadow p-4">
          <div class="flex items-start gap-3">
            <!-- Avatar (placeholder) -->
            <Avatar
                :image="comment.author.picture || undefined"
                :label="comment.author.name.charAt(0)"
                shape="circle"
                class="flex-shrink-0"
            />

            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-medium">{{ comment.author.name }}</span>
                  <span class="text-xs text-gray-500 ml-2">{{ formatDate(comment.createdAt) }}</span>

                  <!-- Page info badge -->
                  <span
                      v-if="comment.marker && (!props.currentPage || props.currentPage !== comment.marker.pageNumber)"
                      class="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded cursor-pointer"
                      @click="jumpToMarker(comment)"
                  >
                    Page {{ comment.marker.pageNumber }}
                  </span>
                </div>

                <!-- Resolution badge -->
                <span
                    v-if="comment.isResolved"
                    class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  Resolved
                </span>
              </div>

              <!-- Comment text -->
              <p class="mt-2 text-gray-700">{{ comment.comment }}</p>

              <!-- Action buttons -->
              <div class="mt-3 flex gap-2">
                <Button
                    v-if="!comment.isResolved"
                    @click="resolveComment(comment)"
                    label="Resolve"
                    severity="success"
                    size="small"
                    text
                />
                <Button
                    @click="startReply(comment.id)"
                    label="Reply"
                    severity="info"
                    size="small"
                    text
                />
              </div>

              <!-- Reply form -->
              <div v-if="replyingToId === comment.id" class="mt-3">
                <FloatLabel variant="on">
                  <label for="reply-text">Reply to this comment</label>
                  <InputText id="reply-text" v-model="replyText" class="w-full" />
                </FloatLabel>
                <div class="mt-2 flex gap-2">
                  <Button @click="submitReply(comment)" label="Submit" size="small" />
                  <Button @click="cancelReply" label="Cancel" severity="secondary" size="small" text />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Child comments (replies) -->
        <div v-if="comment.replies && comment.replies.length > 0" class="ml-8 mt-2 space-y-2">
          <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="comment-card bg-gray-50 rounded-lg shadow-sm p-3 border-l-4 border-blue-300"
          >
            <div class="flex items-start gap-3">
              <!-- Avatar (placeholder) -->
              <Avatar
                  :image="reply.author.picture || undefined"
                  :label="reply.author.name.charAt(0)"
                  shape="circle"
                  class="flex-shrink-0 w-8 h-8"
              />

              <div class="flex-grow">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="font-medium">{{ reply.author.name }}</span>
                    <span class="text-xs text-gray-500 ml-2">{{ formatDate(reply.createdAt) }}</span>
                  </div>

                  <!-- Resolution badge -->
                  <span
                      v-if="reply.isResolved"
                      class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                  >
                    Resolved
                  </span>
                </div>

                <!-- Reply text -->
                <p class="mt-1 text-gray-700">{{ reply.comment }}</p>

                <!-- Resolve button -->
                <div v-if="!reply.isResolved" class="mt-2">
                  <Button
                      @click="resolveComment(reply)"
                      label="Resolve"
                      severity="success"
                      size="small"
                      text
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>