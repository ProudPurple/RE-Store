const API_URL = 'https://nonlinkage-unpunctiliously-goldie.ngrok-free.dev';

export async function addPhoto(url) {
  await fetch(`${API_URL}/groups/add-photo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
}

export async function getGroups() {
  const res = await fetch(`${API_URL}/groups`);
  return res.json();
}

export async function getPhoto(groupIndex, photoIndex) {
  const groups = await getGroups();
  return groups[groupIndex]?.photos?.[photoIndex];
}