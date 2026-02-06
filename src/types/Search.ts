export interface SearchResultDTO {
  documentId: string;
  projectId: string;
  projectName: string;
  title: string;
  documentTypeId: string;
  snippet?: string;
  rank: number;
}
