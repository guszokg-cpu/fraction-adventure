export type WorksheetLevel = "พื้นฐาน" | "ฝึกทักษะ" | "ท้าทาย";
export type WorksheetFileType = "PDF" | "Word" | "PNG" | "Link";

export type Worksheet = {
  id: string;
  lessonSlug: string;
  title: string;
  description: string;
  level: WorksheetLevel;
  fileType: WorksheetFileType;
  fileUrl: string;
  previewImage?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
