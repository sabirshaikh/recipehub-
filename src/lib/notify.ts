"use client";

import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

/**
 * Bridge so non-React code (e.g. the Axios interceptors) can show themed antd
 * notifications. `AntdAppBridge` registers the context-aware instance from
 * `App.useApp()`; until then we fall back to the static API.
 */
let instance: NotificationInstance | null = null;

export function registerNotificationInstance(api: NotificationInstance | null) {
  instance = api;
}

function api(): NotificationInstance {
  return instance ?? notification;
}

// De-dupe identical toasts fired in quick succession (e.g. several parallel 429s)
const notify = {
  error(title: string, description?: string, key?: string) {
    api().error({ title, description, key: key ?? title, placement: "topRight" });
  },
  warning(title: string, description?: string, key?: string) {
    api().warning({ title, description, key: key ?? title, placement: "topRight" });
  },
  success(title: string, description?: string, key?: string) {
    api().success({ title, description, key: key ?? title, placement: "topRight" });
  },
};

export default notify;
