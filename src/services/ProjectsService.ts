import type { Project } from "@/types/Project.ts";
import { ApiService } from "@/services/ApiService.ts";

export class ProjectsService extends ApiService<Project> {

    async fetchProjects(): Promise<Project[]> {

        return this.fetchAll('/api/projects');
    }

    async fetchProjectById(projectId: string): Promise<Project> {
        return this.fetch(`/api/projects/${projectId}`);
    }
}
