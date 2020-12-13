import request from "../request";

export function getDaemon() {
  return request({ url: "/daemon" });
}

export function getScheduler() {
  return request({
    url: "/scheduler"
  });
}

export function schedulerAction(action) {
  return request({
    url: `/scheduler/actions/${action}`,
    method: "post"
  });
}

export function getJobs() {
  return request({
    url: "/jobs"
  });
}

export function getJob(id) {
  return request({
    url: `/jobs/${id}`
  });
}

export function addJob(data) {
  return request({
    url: `/jobs`,
    method: "post",
    data
  });
}

export function updateJob(id, data) {
  return request({
    url: `/jobs/${id}`,
    method: "put",
    data
  });
}

export function jobAction(id, action) {
  return request({
    url: `jobs/${id}/actions/${action}`,
    method: "post"
  });
}

export function deleteJob(id) {
  return request({
    url: `/jobs/${id}`,
    method: "delete"
  });
}

export function getFunctions() {
  return request({
    url: "/functions"
  });
}
