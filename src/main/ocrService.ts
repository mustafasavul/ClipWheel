import type { ClipRepository } from './repository';

export class OCRService {
  constructor(private readonly repository: ClipRepository) {}

  extractText(itemId: string): { text: string; available: boolean } {
    const settings = this.repository.getSettings();
    if (!settings.enableOcr) {
      return { available: false, text: 'OCR is disabled. Enable it in Settings after installing a local OCR engine.' };
    }
    this.repository.getItem(itemId);
    return { available: false, text: 'No local OCR engine is configured yet. ClipWheel never sends images to external services.' };
  }
}
