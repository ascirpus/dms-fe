<!-- components/DocumentReviewView.vue -->
<template>
  <div class="animate-[fadeIn_0.5s]">
    <div class="flex justify-content-between align-items-center mb-4 pb-2 border-bottom-1">
      <Button label="Back to Dashboard"
              icon="pi pi-arrow-left"
              @click="$emit('goBack')"
              class="p-button-text" />
      <h2 class="text-xl font-medium text-slate-700 m-0">
        Reviewing: {{ document.filename }}
      </h2>
      <Tag :severity="getStatusSeverity(document.status)" :value="document.status" />
    </div>

    <!-- Two-column layout for document view and comments -->
    <div class="grid">
      <!-- Document viewer -->
      <div class="col-12 lg:col-8">
        <Panel class="h-full">
          <template #header>
            <div class="flex align-items-center">
              <h3 class="m-0 text-lg">Document Viewer</h3>
              <div class="ml-auto">
                <Toolbar>
                  <template #start>
                    <Button label="Add Marker"
                            icon="pi pi-plus-circle"
                            class="p-button-sm mr-2" />
                    <Button label="Zoom In"
                            icon="pi pi-search-plus"
                            class="p-button-sm p-button-outlined mr-2" />
                    <Button label="Zoom Out"
                            icon="pi pi-search-minus"
                            class="p-button-sm p-button-outlined" />
                  </template>
                </Toolbar>
              </div>
            </div>
          </template>

          <!-- PDF Rendering Area -->
          <div class="bg-[var(--surface-ground)] rounded-lg min-h-[550px] flex align-items-center justify-content-center">
            <div v-if="loading" class="flex flex-column align-items-center">
              <ProgressSpinner />
              <p class="mt-3 text-slate-500">Loading document...</p>
            </div>
            <div v-else class="pdf-content">
              <!-- This is where you would integrate PDF.js -->
              <div class="w-full h-full min-h-[500px] flex flex-column align-items-center justify-content-center">
                <i class="pi pi-file-pdf text-8xl text-slate-300"></i>
                <p class="mt-3 text-slate-500">PDF Viewer would be integrated here</p>
                <p class="text-sm text-slate-400">(Requires PDF.js integration)</p>
                <Button label="Mock Page Navigation"
                        icon="pi pi-arrow-right"
                        class="p-button-outlined mt-3" />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <!-- Comments and actions sidebar -->
      <div class="col-12 lg:col-4">
        <Panel class="h-full">
          <template #header>
            <div class="flex align-items-center">
              <h3 class="m-0 text-lg">Comments</h3>
              <Badge :value="comments.length" class="ml-2" severity="info" />
              <Button icon="pi pi-plus"
                      @click="addNewComment"
                      class="p-button-rounded p-button-text p-button-sm ml-auto"
                      tooltip="Add Comment" />
            </div>
          </template>

          <!-- Comments list -->
          <div class="max-h-[400px] overflow-y-auto">
            <div v-if="comments.length === 0" class="text-center p-4">
              <i class="pi pi-comments text-5xl text-slate-300"></i>
              <p class="mt-2 text-slate-500">No comments yet.</p>
            </div>
            <div v-else>
              <Accordion :multiple="true">
                <AccordionTab v-for="comment in comments" :key="comment.id" :header="comment.marker">
                  <div class="comment-content">
                    <p class="text-sm text-slate-600 mb-2">{{ comment.text }}</p>
                    <div class="flex justify-content-between align-items-center mt-3">
                      <span class="text-xs text-slate-400">- {{ comment.user }}, {{ comment.timeAgo }}</span>
                      <div>
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" />
                      </div>
                    </div>
                  </div>
                </AccordionTab>
              </Accordion>

              <div v-if="showNewCommentForm" class="new-comment-form p-3 mt-3 border-1 border-round surface-200">
                <h4 class="text-sm font-medium">Add New Comment</h4>
                <Dropdown v-model="newComment.marker"
                          :options="markers"
                          placeholder="Select marker"
                          class="w-full mb-2" />
                <Textarea v-model="newComment.text"
                          rows="3"
                          placeholder="Your comment..."
                          class="w-full mb-2" />
                <div class="flex justify-content-end gap-2">
                  <Button label="Cancel"
                          class="p-button-text p-button-sm"
                          @click="showNewCommentForm = false" />
                  <Button label="Save Comment"
                          icon="pi pi-check"
                          class="p-button-sm"
                          @click="saveNewComment" />
                </div>
              </div>
            </div>
          </div>

          <!-- Document actions -->
          <template #footer>
            <div class="document-actions">
              <h4 class="font-medium text-slate-700 mb-3">Document Actions</h4>
              <div class="flex justify-content-between gap-3">
                <Button label="Approve"
                        icon="pi pi-check"
                        class="p-button-success flex-1"
                        @click="approveDocument" />
                <Button label="Decline"
                        icon="pi pi-times"
                        class="p-button-danger flex-1"
                        @click="declineDocument" />
              </div>
            </div>
          </template>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

// Import PrimeVue components
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import ProgressSpinner from 'primevue/progressspinner';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Badge from 'primevue/badge';

// Props
const props = defineProps({
  document: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['goBack']);

// Component registration
const components = {
  Panel,
  Button,
  Tag,
  Toolbar,
  Accordion,
  AccordionTab,
  ProgressSpinner,
  Dropdown,
  Textarea,
  Badge
};

// Toast
const toast = useToast();

// Data
const loading = ref(true);
const comments = ref([]);
const markers = ref(['Marker A', 'Marker B', 'Marker C', 'Marker D']);
const showNewCommentForm = ref(false);
const newComment = ref({
  marker: null,
  text: '',
});

// Methods
const getStatusSeverity = (status) => {
  switch (status) {
    case 'Pending Review':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Declined':
      return 'danger';
    default:
      return 'info';
  }
};

const addNewComment = () => {
  showNewCommentForm.value = true;
  newComment.value = {
    marker: null,
    text: '',
  };
};

const saveNewComment = () => {
  if (!newComment.value.marker || !newComment.value.text) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please complete all fields', life: 3000 });
    return;
  }

  // Add new comment to list
  comments.value.push({
    id: Date.now(),
    marker: newComment.value.marker,
    text: newComment.value.text,
    user: 'Current User',
    timeAgo: 'just now'
  });

  // Reset form
  showNewCommentForm.value = false;
  toast.add({ severity: 'success', summary: 'Success', detail: 'Comment added', life: 3000 });
};

const approveDocument = () => {
  toast.add({
    severity: 'success',
    summary: 'Document Approved',
    detail: `${props.document.filename} has been approved`,
    life: 3000
  });
  emit('goBack');
};

const declineDocument = () => {
  toast.add({
    severity: 'error',
    summary: 'Document Declined',
    detail: `${props.document.filename} has been declined`,
    life: 3000
  });
  emit('goBack');
};

// Mock data
const fetchComments = () => {
  // Simulate API call
  setTimeout(() => {
    comments.value = [
      {
        id: 1,
        marker: 'Marker A',
        text: 'This section needs clarification regarding the Q1 targets.',
        user: 'User A',
        timeAgo: '5 mins ago'
      },
      {
        id: 2,
        marker: 'Marker B',
        text: 'Please revise the financial projections based on the updated forecast.',
        user: 'User B',
        timeAgo: '1 hour ago'
      },
      {
        id: 3,
        marker: 'Marker C',
        text: 'The executive summary needs to be more concise and highlight key achievements.',
        user: 'User C',
        timeAgo: '2 hours ago'
      }
    ];
  }, 500);
};

// Simulate loading the PDF
const loadDocument = () => {
  setTimeout(() => {
    loading.value = false;
  }, 1500);
};

// Lifecycle
onMounted(() => {
  fetchComments();
  loadDocument();
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
