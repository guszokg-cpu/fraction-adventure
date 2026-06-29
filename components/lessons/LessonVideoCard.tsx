"use client";

import { useState, useEffect } from "react";
import { toEmbedUrl } from "@/data/lessonVideos";
import { fetchVideosConfig } from "@/lib/videosConfigApi";

type LessonVideoCardProps = {
  lessonPath: string;
  videoUrl?: string;
  title?: string;
};

export function LessonVideoCard({ lessonPath, videoUrl: fallbackUrl = "", title = "วิดีโอประกอบบทเรียน" }: LessonVideoCardProps) {
  const [videoUrl, setVideoUrl] = useState(fallbackUrl);

  useEffect(() => {
    fetchVideosConfig().then((config) => {
      const url = config[lessonPath];
      if (url !== undefined) setVideoUrl(url);
    });
  }, [lessonPath]);

  const embedUrl = toEmbedUrl(videoUrl);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-rose-500 px-5 py-3 text-white">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 text-lg">▶️</span>
        <h2 className="text-lg font-extrabold">{title}</h2>
      </div>

      {embedUrl ? (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 bg-slate-50 py-14">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-red-50 text-5xl shadow-inner">
            🎬
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold text-slate-600">วิดีโอยังไม่พร้อม</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              แอดมินสามารถเพิ่มลิงก์ได้ที่ แผงแอดมิน → จัดการวิดีโอ
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-400">
        <span>📌</span>
        <span>ดูวิดีโอแล้วค่อยทำแบบฝึกหัดในขั้นถัดไป</span>
      </div>
    </div>
  );
}
