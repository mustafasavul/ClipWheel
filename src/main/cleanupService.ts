import type { CleanupJob, CleanupRequest } from '../shared/types';
import type { ClipRepository } from './repository';

export class CleanupService {
  constructor(private readonly repository: ClipRepository) {}

  run(request: CleanupRequest): CleanupJob {
    return this.repository.cleanup(request);
  }
}
