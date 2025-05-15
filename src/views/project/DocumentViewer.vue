<template>
  <div class="document-viewer flex flex-col min-h-screen">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div v-if="loading" class="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div v-else class="flex items-center justify-between">
          <div>
            <div class="flex items-center">
              <Button
                  icon="pi pi-arrow-left"
                  text
                  rounded
                  aria-label="Back"
                  class="mr-2"
                  @click="navigateBack"
              />
              <h1 class="text-3xl font-bold text-gray-900">{{ document?.title }}</h1>
            </div>
            <p class="mt-1 text-sm text-gray-500">{{ document?.description }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <Tag
                v-if="document?.status"
                :value="document.status"
                :severity="getStatusSeverity(document.status)"
            />
            <Button
                v-if="canApproveDocument()"
                icon="pi pi-check"
                label="Approve"
                severity="success"
                @click="approveDocument"
            />
            <Button
                v-if="canRejectDocument()"
                icon="pi pi-times"
                label="Reject"
                severity="danger"
                @click="rejectDocument"
            />
          </div>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <ProgressSpinner />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-red-400 text-lg"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Error loading document
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ error }}
              </div>
              <div class="mt-4">
                <Button
                    icon="pi pi-refresh"
                    label="Try Again"
                    severity="danger"
                    outlined
                    @click="fetchDocument"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Document Content -->
        <div v-else class="flex flex-col md:flex-row gap-6">
          <!-- Document Preview -->
          <div class="w-full md:w-3/4 bg-white shadow rounded-lg">
            <div class="p-4 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <FileIcon :type="getFileType(document?.filename)" class="text-2xl mr-2" />
                  <span class="font-medium">{{ document?.filename }}</span>
                </div>
                <Button
                    icon="pi pi-download"
                    label="Download"
                    outlined
                    @click="downloadDocument"
                />
              </div>
            </div>

            <div class="p-4">
              <!-- PDF or document preview would go here -->
              <div class="min-h-[600px] flex flex-col items-center justify-center bg-gray-50 rounded">
                <iframe
                    v-if="document && isPDF(document.filename)"
                    :src="documentUrl"
                    class="w-full h-[800px]"
                    frameborder="0"
                ></iframe>
                <div v-else class="text-center p-12">
                  <FileIcon :type="getFileType(document?.filename)" class="text-6xl mb-4 text-gray-400" />
                  <h3 class="text-lg font-medium text-gray-900">Document Preview Unavailable</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Preview is not available for this document type. Please download the file to view it.
                  </p>
                  <div class="mt-6">
                    <Button
                        icon="pi pi-download"
                        label="Download"
                        @click="downloadDocument"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Panel -->
          <div class="w-full md:w-1/4">
            <div class="bg-white shadow rounded-lg sticky top-6">
              <div class="p-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <h2 class="text-lg font-medium text-gray-900">Comments</h2>
                  <Button
                      v-if="canAddComment()"
                      icon="pi pi-plus"
                      label="Add Comment"
                      size="small"
                      @click="openAddCommentDialog"
                  />
                </div>
              </div>

              <div class="p-4 max-h-[700px] overflow-y-auto">
                <!-- Loading Comments -->
                <div v-if="loadingComments" class="flex justify-center py-4">
                  <ProgressSpinner style="width: 30px; height: 30px;" />
                </div>

                <!-- No Comments -->
                <div v-else-if="!comments.length" class="text-center py-6">
                  <i class="pi pi-comments text-3xl text-gray-300 mb-2"></i>
                  <p class="text-sm text-gray-500">No comments yet</p>
                  <div v-if="canAddComment()" class="mt-4">
                    <Button
                        icon="pi pi-plus"
                        label="Add Comment"
                        size="small"
                        outlined
                        @click="openAddCommentDialog"
                    />
                  </div>
                </div>

                <!-- Comments List -->
                <div v-else class="space-y-4">
                  <div
                      v-for="comment in comments"
                      :key="comment.id"
                      class="bg-gray-50 p-3 rounded-lg"
                      :class="{ 'border-l-4 border-green-400': comment.resolvedBy }"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex items-start">
                        <Avatar
                            :image="comment.author?.avatar"
                            shape="circle"
                            class="mr-2"
                            size="small"
                        />
                        <div>
                          <div class="text-sm font-medium text-gray-900">
                            {{ comment.author?.name || 'Unknown User' }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ formatDate(comment.createdAt) }}
                          </div>
                          <div class="mt-2 text-sm text-gray-700 whitespace-pre-line">
                            {{ comment.comment }}
                          </div>
                          <div v-if="comment.marker" class="mt-1 text-xs text-blue-600">
                            <button
                                class="flex items-center"
                                @click="navigateToMarker(comment.marker)"
                            >
                              <i class="pi pi-map-marker mr-1"></i>
                              Page {{ comment.marker.pageNumber }}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="flex space-x-1">
                        <Button
                            v-if="!comment.resolvedBy"
                            icon="pi pi-check"
                            text
                            rounded
                            size="small"
                            @click="resolveComment(comment)"
                            tooltip="Resolve Comment"
                            tooltipOptions="{ position: 'left' }"
                        />
                        <Button
                            v-if="canDeleteComment(comment)"
                            icon="pi pi-trash"
                            text
                            rounded
                            size="small"
                            severity="danger"
                            @click="confirmDeleteComment(comment)"
                            tooltip="Delete Comment"
                            tooltipOptions="{ position: 'left' }"
                        />
                      </div>
                    </div>
                    <div v-if="comment.resolvedBy" class="mt-2 text-xs text-green-600 flex items-center">
                      <i class="pi pi-check-circle mr-1"></i>
                      Resolved by {{ getResolverName(comment) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Comment Dialog -->
    <Dialog
        v-model:visible="addCommentDialog"
        header="Add Comment"
        :modal="true"
        :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="field">
          <label for="comment" class="block text-sm font-medium text-gray-700">Comment</label>
          <Textarea
              id="comment"
              v-model="newComment.text"
              rows="4"
              class="w-full mt-1"
              placeholder="Enter your comment here..."
              :class="{ 'p-invalid': v$.text.$invalid && v$.text.$dirty }"
              aria-describedby="comment-error"
          />
          <small id="comment-error" class="p-error" v-if="v$.text.$invalid && v$.text.$dirty">
            {{ v$.text.$errors[0].$message }}
          </small>
        </div>

        <div class="field">
          <div class="flex items-center">
            <Checkbox
                v-model="newComment.hasMarker"
                inputId="hasMarker"
                binary
            />
            <label for="hasMarker" class="ml-2 text-sm text-gray-700">Add marker to document</label>
          </div>
        </div>

        <div class="field" v-if="newComment.hasMarker">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="pageNumber" class="block text-sm font-medium text-gray-700">Page Number</label>
              <InputNumber
                  id="pageNumber"
                  v-model="newComment.marker.pageNumber"
                  class="w-full mt-1"
                  :min="1"
                  :showButtons="false"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Position</label>
              <div class="flex gap-2 mt-1">
                <div class="w-1/2">
                  <InputNumber
                      v-model="newComment.marker.x"
                      placeholder="X"
                      class="w-full"
                      :min="0"
                      :showButtons="false"
                  />
                </div>
                <div class="w-1/2">
                  <InputNumber
                      v-model="newComment.marker.y"
                      placeholder="Y"
                      class="w-full"
                      :min="0"
                      :showButtons="false"
                  />
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            You can set the position to where the marker should appear on the document.
          </p>
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="addCommentDialog = false"
            text
        />
        <Button
            label="Add Comment"
            icon="pi pi-check"
            @click="submitComment"
            :loading="submittingComment"
            :disabled="v$.$invalid"
        />
      </template>
    </Dialog>

    <!-- Status Dialog -->
    <Dialog
        v-model:visible="statusDialog.visible"
        :header="statusDialog.title"
        :modal="true"
        :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="text-center mb-4">
          <i :class="statusDialog.icon" class="text-5xl mb-4"></i>
          <p>{{ statusDialog.message }}</p>
        </div>

        <div class="field">
          <label for="status-comment" class="block text-sm font-medium text-gray-700">Comment (Optional)</label>
          <Textarea
              id="status-comment"
              v-model="statusDialog.comment"
              rows="3"
              class="w-full mt-1"
              placeholder="Add a comment about your decision..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            :label="statusDialog.cancelLabel"
            icon="pi pi-times"
            @click="statusDialog.visible = false"
            text
        />
        <Button
            :label="statusDialog.confirmLabel"
            :icon="statusDialog.confirmIcon"
            :severity="statusDialog.severity"
            @click="confirmStatusChange"
            :loading="statusDialog.processing"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import { DocumentStatus } from '@/types/Document';
import type { Document } from '@/types/Document';
import type { Comment, Marker } from '@/types/Comment';
import type { User } from '@/types/User';

// PrimeVue Components
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import Avatar from 'primevue/avatar';
import ConfirmDialog from 'primevue/confirmdialog';

// Custom Components
import FileIcon from '@/components/FileIcon.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const projectId = computed(() => route.params.projectId as string);
const documentId = computed(() => route.params.documentId as string);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const document = ref<Document | null>(null);
const comments = ref<Comment[]>([]);
const loadingComments = ref(true);
const addCommentDialog = ref(false);
const submittingComment = ref(false);

// Document URL for preview
const documentUrl = computed(() => {
  if (!document.value || !document.value.id) return '';
  return `/api/documents/${document.value.id}/content`;
});

// New comment form
const newComment = reactive({
  text: '',
  hasMarker: false,
  marker: {
    pageNumber: 1,
    x: 0,
    y: 0
  }
});

// Status dialog configuration
const statusDialog = reactive({
  visible: false,
  title: '',
  message: '',
  icon: '',
  confirmLabel: '',
  confirmIcon: '',
  cancelLabel: 'Cancel',
  severity: 'primary',
  processing: false,
  comment: '',
  action: '' as 'approve' | 'reject'
});

// Validation rules
const rules = computed(() => ({
  text: { required, minLength: minLength(1) }
}));
const v$ = useVuelidate(rules, newComment);

// Fetch document and comments on component mount
onMounted(() => {
  fetchDocument();
  fetchComments();
});

// Methods
async function fetchDocument() {
  loading.value = true;
  error.value = null;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/projects/${projectId.value}/documents/${documentId.value}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    document.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching document:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  loadingComments.value = true;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/documents/${documentId.value}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    comments.value = await response.json();
  } catch (err) {
    console.error('Error fetching comments:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load comments',
      life: 5000
    });
  } finally {
    loadingComments.value = false;
  }
}

function navigateBack() {
  router.push({
    name: 'project-detail',
    params: { id: projectId.value }
  });
}

function downloadDocument() {
  if (!document.value) return;

  // Create a link element and trigger download
  const link = document.createElement('a');
  link.href = documentUrl.value;
  link.download = document.value.filename || 'document';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openAddCommentDialog() {
  newComment.text = '';
  newComment.hasMarker = false;
  newComment.marker.pageNumber = 1;
  newComment.marker.x = 0;
  newComment.marker.y = 0;
  v$.value.$reset();
  addCommentDialog.value = true;
}

async function submitComment() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  submittingComment.value = true;

  try {
    // Prepare comment data
    const commentData = {
      documentId: documentId.value,
      comment: newComment.text,
      marker: newComment.hasMarker ? {
        pageNumber: newComment.marker.pageNumber,
        position: {
          x: newComment.marker.x,
          y: newComment.marker.y
        }
      } : null
    };

    // Replace with your actual API call
    const response = await fetch(`/api/documents/${documentId.value}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    const createdComment = await response.json();
    comments.value.push(createdComment);

    addCommentDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Comment Added',
      detail: 'Your comment has been added successfully.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to add comment',
      life: 5000
    });
  } finally {
    submittingComment.value = false;
  }
}

function navigateToMarker(marker: Marker) {
  // In a real implementation, this would scroll to the marker position
  console.log(`Navigating to marker at page ${marker.pageNumber}, position (${marker.position.x}, ${marker.position.y})`);

  // For PDF viewer, you would navigate to the specific page
  // Example for PDF.js viewer:
  // const viewer = document.querySelector('#pdf-viewer');
  // if (viewer) {
  //   viewer.contentWindow.postMessage({
  //     type: 'navigate',
  //     page: marker.pageNumber,
  //     position: marker.position
  //   }, '*');
  // }
}

async function resolveComment(comment: Comment) {
  try {
    // Replace with your actual API call
    const response = await fetch(`/api/comments/${comment.id}/resolve`, {
      method: 'PUT'
    });

    if (!response.ok) {
      throw new Error('Failed to resolve comment');
    }

    const resolvedComment = await response.json();

    // Update the comment in the list
    const index = comments.value.findIndex(c => c.id === resolvedComment.id);
    if (index !== -1) {
      comments.value[index] = resolvedComment;
    }

    toast.add({
      severity: 'success',
      summary: 'Comment Resolved',
      detail: 'Comment has been marked as resolved.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to resolve comment',
      life: 5000
    });
  }
}

function confirmDeleteComment(comment: Comment) {
  confirm.require({
    message: 'Are you sure you want to delete this comment?',
    header: 'Delete Comment',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteComment(comment),
    reject: () => {
      // Do nothing
    }
  });
}

async function deleteComment(comment: Comment) {
  try {
    // Replace with your actual API call
    const response = await fetch(`/api/comments/${comment.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    // Remove comment from list
    comments.value = comments.value.filter(c => c.id !== comment.id);

    toast.add({
      severity: 'success',
      summary: 'Comment Deleted',
      detail: 'Comment has been deleted successfully.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to delete comment',
      life: 5000
    });
  }
}

function getResolverName(comment: Comment): string {
  if (!comment.resolvedBy) return 'Unknown';

  if (comment.resolver) {
    return comment.resolver.name;
  }

  return 'Unknown User';
}

function approveDocument() {
  statusDialog.title = 'Approve Document';
  statusDialog.message = `Are you sure you want to approve "${document.value?.title}"?`;
  statusDialog.icon = 'pi pi-check-circle text-green-500';
  statusDialog.confirmLabel = 'Approve';
  statusDialog.confirmIcon = 'pi pi-check';
  statusDialog.severity = 'success';
  statusDialog.action = 'approve';
  statusDialog.comment = '';
  statusDialog.visible = true;
}

function rejectDocument() {
  statusDialog.title = 'Reject Document';
  statusDialog.message = `Are you sure you want to reject "${document.value?.title}"?`;
  statusDialog.icon = 'pi pi-times-circle text-red-500';
  statusDialog.confirmLabel = 'Reject';
  statusDialog.confirmIcon = 'pi pi-times';
  statusDialog.severity = 'danger';
  statusDialog.action = 'reject';
  statusDialog.comment = '';
  statusDialog.visible = true;
}

async function confirmStatusChange() {
  statusDialog.processing = true;

  const newStatus = statusDialog.action === 'approve'
      ? DocumentStatus.APPROVED
      : DocumentStatus.DECLINED;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/documents/${documentId.value}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus,
        comment: statusDialog.comment
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update document status');
    }

    const updatedDocument = await response.json();
    document.value = updatedDocument;

    // If a comment was added, refresh comments
    if (statusDialog.comment) {
      fetchComments();
    }

    statusDialog.visible = false;
    toast.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Document has been ${statusDialog.action === 'approve' ? 'approved' : 'rejected'}.`,
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to update document status',
      life: 5000
    });
  } finally {
    statusDialog.processing = false;
  }
}

// Helper methods
function getFileType(filename: string | null): string {
  if (!filename) return 'file';

  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf': return 'pdf';
    case 'doc':
    case 'docx': return 'word';
    case 'xls':
    case 'xlsx': return 'excel';
    case 'ppt':
    case 'pptx': return 'powerpoint';
    default: return 'file';
  }
}

function isPDF(filename: string | null): boolean {
  if (!filename) return false;
  return filename.toLowerCase().endsWith('.pdf');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getStatusSeverity(status: DocumentStatus): string {
  const statusMap: Record<DocumentStatus, string> = {
    [DocumentStatus.PENDING]: 'warning',
    [DocumentStatus.APPROVED]: 'success',
    [DocumentStatus.DECLINED]: 'danger'
  };

  return statusMap[status] || 'secondary';
}

// Permission check methods
function canApproveDocument(): boolean {
  if (!document.value) return false;

  // In a real app, you would check user permissions here
  return document.value.status === DocumentStatus.PENDING;
}

function canRejectDocument(): boolean {
  // Similar to approve check
  return canApproveDocument();
}

function canAddComment(): boolean {
  // In a real app, you would check user permissions here
  return true;
}

function canDeleteComment(comment: Comment): boolean {
  // In a real app, you would check if the user is the author
  // For now, we'll assume current user is the one in props
  return true;
}
</script>