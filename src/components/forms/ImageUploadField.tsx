"use client";

import { useState } from "react";
import Image from "next/image";
import { App, Button, Input, Progress, Upload } from "antd";
import { DeleteOutlined, InboxOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { isApiError } from "@/lib/api-error";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, isOptimizableImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { uploadService } from "@/services/uploadService";
import type { UploadMode } from "@/types/upload";

interface ImageUploadFieldProps {
  /** Injected by antd Form.Item */
  value?: string;
  onChange?: (value: string) => void;
  /** Where files are stored — decided on the server (see getUploadMode). */
  mode?: UploadMode;
  /** Compact button-style variant (used for step photos). */
  compact?: boolean;
  label?: string;
}

/**
 * Controlled image field for antd forms. Uploads the chosen file (Cloudinary, or
 * local dev storage when Cloudinary isn't configured) with a progress bar, and
 * also accepts a pasted https image URL.
 */
export default function ImageUploadField({
  value = "",
  onChange,
  mode = "local",
  compact = false,
  label = "image",
}: ImageUploadFieldProps) {
  const { message } = App.useApp();
  const [progress, setProgress] = useState<number | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const uploading = progress !== null;

  function validate(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      message.error("Please choose a JPG, PNG, WebP or AVIF image.");
      return false;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      message.error("Images must be 5 MB or smaller.");
      return false;
    }
    return true;
  }

  async function upload(file: File) {
    setProgress(0);
    try {
      const result = await uploadService.uploadImage(file, { mode, onProgress: setProgress });
      onChange?.(result.url);
      setShowUrlInput(false);
      message.success(value ? "Image replaced" : "Image uploaded");
    } catch (error) {
      const reason = isApiError(error) ? error.message : "Please try again.";
      message.error(`Upload failed. ${reason}`);
      setShowUrlInput(true); // offer the URL fallback
    } finally {
      setProgress(null);
    }
  }

  function applyUrl() {
    const url = urlDraft.trim();
    if (!/^https:\/\/\S+$/i.test(url)) {
      message.error("Paste a full https:// image URL.");
      return;
    }
    onChange?.(url);
    setUrlDraft("");
    setShowUrlInput(false);
  }

  const uploadProps = {
    accept: ACCEPTED_IMAGE_TYPES.join(","),
    showUploadList: false,
    disabled: uploading,
    // Validate, then upload ourselves; returning false stops antd's own XHR
    beforeUpload: (file: File) => {
      if (validate(file)) void upload(file);
      return false;
    },
  };

  const urlInput = (
    <div className="flex w-full max-w-md gap-2">
      <Input
        prefix={<LinkOutlined />}
        placeholder="https://… image URL"
        value={urlDraft}
        onChange={(e) => setUrlDraft(e.target.value)}
        onPressEnter={(e) => {
          e.preventDefault(); // don't submit the whole form
          applyUrl();
        }}
        aria-label={`Paste ${label} URL`}
        autoFocus
      />
      <Button onClick={applyUrl}>Use URL</Button>
      <Button type="text" onClick={() => setShowUrlInput(false)}>
        Cancel
      </Button>
    </div>
  );

  const urlToggle = (
    <Button
      type="link"
      size="small"
      icon={<LinkOutlined />}
      className="!px-0"
      onClick={() => setShowUrlInput(true)}
    >
      Use image URL
    </Button>
  );

  // ── Current image: preview + Replace / Remove
  if (value) {
    return (
      <div className="space-y-3">
        <div className={cn("flex items-start gap-3", !compact && "flex-col sm:flex-row")}>
          <div
            className={cn(
              "relative overflow-hidden rounded-brand border border-border bg-brand-50",
              compact ? "size-20" : "aspect-[4/3] w-full max-w-sm",
            )}
          >
            <Image
              src={value}
              alt={`Selected ${label}`}
              fill
              sizes={compact ? "80px" : "384px"}
              unoptimized={!isOptimizableImage(value)}
              className={cn("object-cover transition", uploading && "opacity-50")}
            />
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-2">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? "Uploading…" : "Replace"}
                </Button>
              </Upload>
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={uploading}
                onClick={() => onChange?.("")}
              >
                Remove
              </Button>
            </div>
            {!showUrlInput && urlToggle}
            {uploading && <Progress percent={progress} size="small" className="w-48" />}
          </div>
        </div>
        {showUrlInput && urlInput}
      </div>
    );
  }

  // ── No image yet
  return (
    <div className="space-y-3">
      {compact ? (
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? "Uploading…" : "Add photo"}
          </Button>
        </Upload>
      ) : (
        <Upload.Dragger {...uploadProps} className="block">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag a photo here</p>
          <p className="ant-upload-hint">JPG, PNG, WebP or AVIF · up to 5 MB</p>
        </Upload.Dragger>
      )}
      {uploading && <Progress percent={progress} size="small" />}
      {showUrlInput ? urlInput : urlToggle}
    </div>
  );
}
