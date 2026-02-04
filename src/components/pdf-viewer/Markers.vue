<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, inject, type Ref, watch, useTemplateRef, nextTick } from 'vue';
import type { Comment, MarkerPosition } from "@/types";
import { useComments } from "@/composables/useComments.ts";
import { useMainStore } from "@/stores/mainStore.ts";
import { FloatLabel, InputText, Button } from "primevue";

interface Props {
  pageNumber: number;
  projectId: string;
  documentId: string;
  fileId: string;
}

const props = defineProps<Props>()
const pdfComponent = inject<Ref<HTMLElement>>('pdfComponentRef')!!

const { comments, addComment, resolveComment } = useComments();
const emit = defineEmits(['marker-resolved', 'marker-created']);

const appState =  useMainStore();
const selectedMarker = ref<Comment | null>(null);
const placingMarker = ref(false);
const newMarkerModal = ref(false);
const newMarkerPosition = ref<MarkerPosition | null>(null);
const newMarkerComment = ref('');
const markersOverlay = ref(null);
const modalPosition = ref({ top: '0px', left: '0px' });

// Necessary for offset calculation
const controlsHeight = 58;
const markerHeight = 30;

const visibleMarkers = computed(() => {
  return comments.value.filter((comment: Comment) => comment.marker?.pageNumber === props.pageNumber);
});

const enableMarkerPlacement = () => {
  placingMarker.value = true;
  // Change cursor to indicate marking mode
  document.body.style.cursor = 'crosshair';
};

const cancelMarkerPlacement = () => {
  placingMarker.value = false;
  newMarkerPosition.value = null;
  newMarkerComment.value = '';
  newMarkerModal.value = false;
  // Reset cursor
  document.body.style.cursor = 'default';
};

const saveNewMarker = async () => {
  if (!newMarkerPosition.value || !newMarkerComment.value.trim()) {
    alert('Please add a comment and select a position.');
    return;
  }

  try {
    const newMarker = await addComment(
        props.projectId,
        props.documentId,
        props.fileId,
        newMarkerComment.value,
        {
          pageNumber: props.pageNumber,
          position: newMarkerPosition.value
        }
    );

    emit('marker-created', newMarker);
    cancelMarkerPlacement();
  } catch (error) {
    console.error('Error saving marker:', error);
    alert('Failed to save comment. Please try again.');
  }
};

const resolveMarker = async (marker: Comment) => {
  try {
    // In a real app, you would update this via API/store
    // Example: await pdfMarkersStore.resolveMarker(marker.id);

    // Update local state
    marker.isResolved = true;

    // Emit event for parent components
    emit('marker-resolved', marker.id);

    selectedMarker.value = null;
  } catch (error) {
    console.error('Error resolving marker:', error);
    alert('Failed to resolve comment. Please try again.');
  }
};

const getMarkerStyle = (comment: Comment) => {
  const marker = comment.marker;

  const pdfElement = pdfComponent.value?.$el;
  if (!pdfElement) return;

  if (!marker) {
    return;
  }

  if (marker.pageNumber !== props.pageNumber) {
    return { display: 'none' };
  }

  const { x, y } = marker.position

  // Place the marker relative to the pdf document itself, seemingly ignoring the control component height
  // and offset the height by the height of the marker itself so it looks like the chat bubble points to
  // where the marker was placed, rather than below it
  return {
    left: `${x}px`,
    top: `${ y + controlsHeight - markerHeight}px`,
    opacity: comment.isResolved ? '0.5' : '1'
  };
};

const showMarkerDetails = (comment: Comment) => {

  // Close the marker by clicking the same marker twice
  if (selectedMarker.value == comment) {
    selectedMarker.value = null;
    return;
  }

  selectedMarker.value = comment;

  // Close any new marker modal that might be open
  newMarkerModal.value = false;

  // Position the modal near the marker
  if (comment.marker) {

    calculateModalPosition(comment.marker.position.x, comment.marker.position.y);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const calculateModalPosition = (x: number, y: number) => {
  if (!pdfComponent.value?.$el) return;

  const pdfRect = pdfComponent.value.$el.getBoundingClientRect();
  const modalWidth = 390; // Max modal width from CSS
  const modalHeight = 65; // Approximate modal height

  // Calculate if modal would go out of bounds
  let left = x;
  let top = y;

  // Check right boundary
  if (left + modalWidth > pdfRect.width) {
    left = x - modalWidth;
  }

  // If left would be negative, anchor to left edge
  if (left < 0) {
    left = 0;
  }

  // Check bottom boundary
  if (top < modalHeight) {
    top = 0;
  }

  const offsetX = pdfRect.left;
  const offsetY = pdfRect.top;

  modalPosition.value = {
    left: `${offsetX+left}px`,
    top: `${offsetY+top}px`
  };
};

const handleDocumentClick = (event) => {
  // Close any open modals first
  selectedMarker.value = null;

  // Only process clicks if in marker placement mode
  if (!appState.documentMarker) return;

  // Check if the click was inside the PDF viewer
  const pdfElement = pdfComponent.value?.$el;
  if (!pdfElement) return;

  const pdfRect = pdfElement.getBoundingClientRect();

  // Check if click is inside the PDF area
  if (
      event.clientX >= pdfRect.left &&
      event.clientX <= pdfRect.right &&
      event.clientY >= pdfRect.top &&
      event.clientY <= pdfRect.bottom
  ) {
    // Calculate coordinates relative to the PDF container
    const x = Math.round(event.clientX - pdfRect.left);
    const y = Math.round(event.clientY - pdfRect.top);

    newMarkerPosition.value = { x, y };
    calculateModalPosition(x, y);

    newMarkerModal.value = true;

    nextTick(() => {
      document.getElementById('add-comment')?.focus()
    })

    // Stop event propagation
    event.stopPropagation();
    // appState.toggleDocumentMarker(false);
  }
};

// Close modals when clicking outside
const handleGlobalClick = (event) => {
  // Skip if click is on a marker or modal
  if (event.target.closest('.comment-marker') ||
      event.target.closest('.modal-content')) {
    return;
  }

  // Close modals
  selectedMarker.value = null;
  if (!appState.documentMarker) {
    newMarkerModal.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  pdfComponent.value.$el.addEventListener('click', handleDocumentClick);
  document.addEventListener('click', handleGlobalClick);
});

onBeforeUnmount(() => {
  // Clean up event listeners
  pdfComponent.value?.$el.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('click', handleGlobalClick);

  // Reset cursor just in case
  document.body.style.cursor = 'default';
});

const onEnterPressed = (event: KeyboardEvent) => {
  if (event.key != 'Enter') {
    return;
  }

  // Enter is pressed while the new comment modal is open, imitate submit.
  if (newMarkerModal.value) {
    saveNewMarker()
  }
}

const onEscapePressed = (event: KeyboardEvent) => {

  if (event.key != 'Escape') {
    return;
  }

  if (newMarkerModal.value) {
    newMarkerModal.value = false;
  }

  if (selectedMarker.value) {
    selectedMarker.value = null;
  }
};

onMounted(async() => {
    document.addEventListener('keydown', onEscapePressed)
    document.addEventListener('keydown', onEnterPressed)
});
</script>

<template>
  <div class="markers-overlay" ref="markersOverlay">
    <div
        v-for="marker in visibleMarkers"
        :key="marker.id"
        class="comment-marker"
        :style="getMarkerStyle(marker)"
        @click.stop="showMarkerDetails(marker)"
    >
      <span class="marker-icon">💬</span>
    </div>
  </div>

  <!-- Add new marker button -->
  <button @click="enableMarkerPlacement" class="add-marker-btn">
    Add Comment
  </button>

  <!-- Marker details modal -->
  <div v-if="selectedMarker" class="marker-modal marker-modal-positioned">
    <div class="modal-content flex-col items-start" :style="modalPosition">
      <p>{{ selectedMarker.comment }}</p>
      <p><small>By: {{ selectedMarker.author.name }} on {{ formatDate(selectedMarker.createdAt) }}</small></p>
      <div class="modal-actions">
        <Button @click="resolveMarker(selectedMarker)" v-if="!selectedMarker.isResolved" label="Resolve" />
        <Button @click="selectedMarker = null" label="Close" />
      </div>
    </div>
  </div>

  <div v-if="newMarkerModal" class="marker-modal marker-modal-positioned">
    <div class="modal-content" :style="modalPosition">
      <FloatLabel variant="on">
        <label for="add-comment">Add comment</label>
        <InputText ref="commentInput" id="add-comment" v-model="newMarkerComment" />
      </FloatLabel>
      <div class="modal-actions">
        <Button icon="pi pi-check" severity="success" @click="saveNewMarker" />
        <Button icon="pi pi-times" severity="danger" @click="cancelMarkerPlacement" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-marker {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 204, 0, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
  transition: transform 0.2s;
}

.comment-marker:hover {
  transform: scale(1.1);
}

.marker-icon {
  font-size: 16px;
}

.add-marker-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 20;
}

.marker-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.marker-modal-positioned {
  background-color: transparent;
  pointer-events: none;
}

.modal-content {
  background-color: white;
  padding: 16px;
  display: flex;
  border-radius: 4px;
  width: 390px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: absolute;
  pointer-events: auto;
}

.modal-actions {
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

button:hover {
  background-color: #2980b9;
}
</style>