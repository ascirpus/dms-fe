<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, inject, type Ref, nextTick, watch, type ComponentPublicInstance } from 'vue';
import type { Comment, MarkerPosition, User } from '@/types';
import type { TenantUser } from '@/services/UsersService';
import { useComments } from '@/composables/useComments';
import { useMainStore } from '@/stores/mainStore';
import { getAvatarColor, getInitialsFromUser, getDisplayName } from '@/utils/avatar';
import { Button } from 'primevue';

interface Props {
  pageNumber: number;
  projectId: string;
  documentId: string;
  fileId: string;
  fileVersion: number;
  highlightedCommentId?: string | null;
  markersExpanded?: boolean;
  showAllComments?: boolean;
  showMyComments?: boolean;
  currentUser?: User;
  projectMembers?: TenantUser[];
}

const props = withDefaults(defineProps<Props>(), {
  highlightedCommentId: null,
  markersExpanded: true,
  showAllComments: false,
  showMyComments: false,
  projectMembers: () => [],
});

const pdfComponent = inject<Ref<ComponentPublicInstance | null>>('pdfComponentRef')!;
const { comments, addComment, resolveComment } = useComments();
const emit = defineEmits(['marker-created', 'marker-resolved', 'reply-to-comment', 'share-comment']);

const appState = useMainStore();
const overlayRef = ref<HTMLElement | null>(null);
const selectedMarker = ref<Comment | null>(null);
const newMarkerModal = ref(false);
const newMarkerPosition = ref<MarkerPosition | null>(null);
const newMarkerComment = ref('');
const modalPosition = ref({ top: '0px', left: '0px' });

// @mention state
const mentionActive = ref(false);
const mentionQuery = ref('');
const mentionStartIndex = ref(-1);
const mentionResults = computed(() => {
  if (!mentionActive.value || !mentionQuery.value) return props.projectMembers.slice(0, 5);
  const q = mentionQuery.value.toLowerCase();
  return props.projectMembers
    .filter(m => {
      const full = `${m.firstName ?? ''} ${m.lastName ?? ''} ${m.email}`.toLowerCase();
      return full.includes(q);
    })
    .slice(0, 5);
});

const animatingMarkerId = ref<string | null>(null);
let animationTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => props.highlightedCommentId, (id) => {
  if (animationTimer) clearTimeout(animationTimer);
  if (id) {
    animatingMarkerId.value = id;
    selectedMarker.value = null;
    animationTimer = setTimeout(() => { animatingMarkerId.value = null; }, 1500);
  } else {
    animatingMarkerId.value = null;
  }
}, { immediate: true });

const markerSize = 32;

const visibleMarkers = computed(() => {
  let filtered = comments.value.filter(
    (c: Comment) => c.fileId === props.fileId && c.marker?.pageNumber === props.pageNumber
  );
  if (props.showMyComments && props.currentUser) {
    filtered = filtered.filter(c => c.author.email === props.currentUser!.email);
  }
  return filtered;
});

const expandedMarkers = computed(() => {
  if (!props.markersExpanded) {
    return visibleMarkers.value.filter(m =>
      m.id === animatingMarkerId.value || m.id === selectedMarker.value?.id
    );
  }
  return visibleMarkers.value.filter(m =>
    !m.isResolved || m.id === animatingMarkerId.value || m.id === selectedMarker.value?.id
  );
});

const getMarkerStyle = (comment: Comment) => {
  const marker = comment.marker;
  if (!marker || marker.pageNumber !== props.pageNumber) {
    return { display: 'none' };
  }

  const { x, y } = marker.position;
  return {
    left: `${x - markerSize / 2}px`,
    top: `${y - markerSize / 2}px`,
    opacity: comment.isResolved && animatingMarkerId.value !== comment.id ? '0.5' : '1',
  };
};

const getMarkerInitials = (comment: Comment): string => {
  return getInitialsFromUser(comment.author);
};

const getMarkerColor = (comment: Comment): string => {
  return getAvatarColor(comment.author.email);
};

const showMarkerDetails = (comment: Comment) => {
  if (selectedMarker.value?.id === comment.id) {
    selectedMarker.value = null;
    return;
  }
  selectedMarker.value = comment;
  newMarkerModal.value = false;
};

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

const calculateModalPosition = (x: number, y: number) => {
  if (!overlayRef.value) return;
  const overlayRect = overlayRef.value.getBoundingClientRect();
  const modalWidth = 340;

  const viewportX = overlayRect.left + x;
  const viewportY = overlayRect.top + y;

  let left = viewportX + markerSize / 2 + 8;
  if (left + modalWidth > window.innerWidth) {
    left = viewportX - modalWidth - 8;
  }
  if (left < 0) left = 0;

  modalPosition.value = {
    left: `${left}px`,
    top: `${viewportY}px`,
  };
};

const resolveMarker = async (marker: Comment) => {
  try {
    await resolveComment(props.projectId, marker);
    emit('marker-resolved', marker.id);
  } catch (error) {
    console.error('Error resolving marker:', error);
  }
};

const saveNewMarker = async () => {
  if (!newMarkerPosition.value || !newMarkerComment.value.trim()) return;

  try {
    const newMarker = await addComment(
      props.projectId,
      props.documentId,
      props.fileId,
      props.fileVersion,
      newMarkerComment.value,
      { pageNumber: props.pageNumber, position: newMarkerPosition.value },
    );
    emit('marker-created', newMarker);
    cancelMarkerPlacement();
  } catch (error) {
    console.error('Error saving marker:', error);
  }
};

const cancelMarkerPlacement = () => {
  newMarkerPosition.value = null;
  newMarkerComment.value = '';
  newMarkerModal.value = false;
  mentionActive.value = false;
};

const handleCommentInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const value = input.value;
  const cursorPos = input.selectionStart ?? value.length;

  // Check for @mention trigger
  const textBeforeCursor = value.substring(0, cursorPos);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex >= 0) {
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
    if (!textAfterAt.includes(' ') || textAfterAt.length <= 20) {
      mentionActive.value = true;
      mentionQuery.value = textAfterAt;
      mentionStartIndex.value = lastAtIndex;
      return;
    }
  }

  mentionActive.value = false;
};

const selectMention = (member: TenantUser) => {
  const name = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.email;
  const before = newMarkerComment.value.substring(0, mentionStartIndex.value);
  const after = newMarkerComment.value.substring(
    mentionStartIndex.value + 1 + mentionQuery.value.length,
  );
  newMarkerComment.value = `${before}@${name} ${after}`;
  mentionActive.value = false;
};

const handleDocumentClick = (event: MouseEvent) => {
  selectedMarker.value = null;
  if (!appState.documentMarker) return;
  if (!overlayRef.value) return;

  const overlayRect = overlayRef.value.getBoundingClientRect();
  const x = Math.round(event.clientX - overlayRect.left);
  const y = Math.round(event.clientY - overlayRect.top);

  newMarkerPosition.value = { x, y };
  calculateModalPosition(x, y);
  newMarkerModal.value = true;

  nextTick(() => {
    document.getElementById('marker-comment-input')?.focus();
  });

  event.stopPropagation();
};

const handleGlobalClick = (event: MouseEvent) => {
  if (
    (event.target as HTMLElement).closest('.comment-marker') ||
    (event.target as HTMLElement).closest('.marker-card-inline') ||
    (event.target as HTMLElement).closest('.marker-modal-content')
  ) {
    return;
  }
  selectedMarker.value = null;
  if (!appState.documentMarker) {
    newMarkerModal.value = false;
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  const tag = (event.target as HTMLElement)?.tagName;
  const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (event.target as HTMLElement)?.isContentEditable;

  if (event.key === 'Escape') {
    if (newMarkerModal.value) cancelMarkerPlacement();
    if (selectedMarker.value) selectedMarker.value = null;
    appState.toggleDocumentMarker(false);
  }
  if (event.key === 'Enter' && newMarkerModal.value && !mentionActive.value) {
    saveNewMarker();
  }
  if (event.key === 'c' && !isEditable && !event.metaKey && !event.ctrlKey && !event.altKey) {
    appState.toggleDocumentMarker(!appState.documentMarker);
  }
};

const getExpandedCardStyle = (comment: Comment): Record<string, string> => {
  if (!comment.marker) return { display: 'none' };
  const { x, y } = comment.marker.position;
  const cardWidth = 320;

  let left = x + markerSize / 2 + 8;
  if (overlayRef.value) {
    const overlayWidth = overlayRef.value.clientWidth;
    if (left + cardWidth > overlayWidth) {
      left = x - cardWidth - 8;
    }
  }
  if (left < 0) left = 0;

  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${y - markerSize / 2}px`,
  };
};

const handleScroll = () => {
  if (selectedMarker.value) {
    selectedMarker.value = null;
  }
};

onMounted(() => {
  pdfComponent.value?.$el?.addEventListener('click', handleDocumentClick);
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('keydown', onKeyDown);
  overlayRef.value?.parentElement?.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  pdfComponent.value?.$el?.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('keydown', onKeyDown);
  overlayRef.value?.parentElement?.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div ref="overlayRef" class="markers-overlay">
    <!-- Marker circles -->
    <div
      v-for="marker in visibleMarkers"
      :key="marker.id"
      class="comment-marker"
      :class="{ 'marker-pop': animatingMarkerId === marker.id }"
      :style="getMarkerStyle(marker)"
      @click.stop="showMarkerDetails(marker)"
    >
      <span
        class="marker-avatar"
        :style="{ backgroundColor: getMarkerColor(marker) }"
      >
        {{ getMarkerInitials(marker) }}
      </span>
    </div>

    <!-- Comment cards (inside overlay so they scroll with markers) -->
    <div
      v-for="marker in expandedMarkers"
      :key="'card-' + marker.id"
      class="marker-card-inline"
      :style="getExpandedCardStyle(marker)"
    >
      <div class="comment-card-header">
        <span
          class="card-avatar"
          :style="{ backgroundColor: getMarkerColor(marker) }"
        >
          {{ getMarkerInitials(marker) }}
        </span>
        <div class="card-header-text">
          <span class="card-author">{{ getDisplayName(marker.author) }}</span>
          <span class="card-date">{{ formatDate(marker.createdAt) }}</span>
        </div>
        <div class="card-actions">
          <Button
            v-if="!marker.isResolved"
            icon="pi pi-check"
            text
            rounded
            size="small"
            severity="success"
            aria-label="Resolve"
            @click="resolveMarker(marker)"
          />
          <!-- TODO: re-enable when reply/share features are ready
          <Button
            icon="pi pi-link"
            text
            rounded
            size="small"
            aria-label="Share link"
            @click="emit('share-comment', marker)"
          />
          -->
        </div>
      </div>
      <p class="card-comment">{{ marker.comment }}</p>
      <!-- TODO: re-enable when reply feature is ready
      <a
        class="card-reply-link"
        @click="emit('reply-to-comment', marker)"
      >
        Reply
      </a>
      -->
    </div>
  </div>

  <!-- New marker input -->
  <div v-if="newMarkerModal" class="marker-modal">
    <div class="marker-modal-content new-marker-input" :style="modalPosition">
      <span
        v-if="currentUser"
        class="card-avatar"
        :style="{ backgroundColor: getAvatarColor(currentUser.email) }"
      >
        {{ getInitialsFromUser(currentUser) }}
      </span>
      <div class="input-wrapper">
        <input
          id="marker-comment-input"
          v-model="newMarkerComment"
          class="comment-input"
          placeholder="Add a comment..."
          @input="handleCommentInput"
        />
        <!-- @mention dropdown -->
        <div v-if="mentionActive && mentionResults.length > 0" class="mention-dropdown">
          <div
            v-for="member in mentionResults"
            :key="member.userId"
            class="mention-item"
            @mousedown.prevent="selectMention(member)"
          >
            <span
              class="mention-avatar"
              :style="{ backgroundColor: getAvatarColor(member.email) }"
            >
              {{ (member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '') }}
            </span>
            <span class="mention-name">
              {{ member.firstName }} {{ member.lastName }}
            </span>
            <span class="mention-email">{{ member.email }}</span>
          </div>
        </div>
      </div>
      <Button
        icon="pi pi-send"
        text
        rounded
        size="small"
        @click="saveNewMarker"
        :disabled="!newMarkerComment.trim()"
      />
    </div>
  </div>
</template>

<style scoped>
.markers-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.comment-marker {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.15s;
}

.comment-marker:hover {
  transform: scale(1.15);
}

.marker-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  user-select: none;
}

.marker-card-inline {
  position: absolute;
  pointer-events: auto;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 12px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 15;
}

.marker-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

.marker-modal-content {
  position: absolute;
  pointer-events: auto;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 12px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.comment-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-avatar {
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

.card-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.card-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.card-actions {
  display: flex;
  gap: 2px;
}

.card-comment {
  font-size: 13px;
  color: var(--text-color);
  margin: 0 0 8px;
  line-height: 1.4;
}

.card-reply-link {
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: none;
}

.card-reply-link:hover {
  text-decoration: underline;
}

/* New marker input */
.new-marker-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.comment-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-color);
  background: transparent;
  padding: 4px 0;
}

.comment-input::placeholder {
  color: var(--text-secondary);
}

.mention-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 260px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 4px;
  z-index: 200;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s;
}

.mention-item:hover {
  background: var(--surface-hover, #f1f5f9);
}

.mention-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  color: white;
  font-size: 9px;
  font-weight: 600;
}

.mention-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color);
}

.mention-email {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: auto;
}

/* Marker pop animation for jump-to-marker */
.marker-pop {
  animation: marker-pop 0.6s ease-out;
  z-index: 20;
}

@keyframes marker-pop {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 transparent);
  }
  40% {
    transform: scale(1.8);
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 transparent);
  }
}
</style>
