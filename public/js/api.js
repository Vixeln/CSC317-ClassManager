// FUTURE BACKEND API TEMPLATE
// All real fetch calls will be placed here.

export async function getClasses() {
    return fetch("/api/classes").then(res => res.json());
}

export async function registerClass(userId, classId) {
    return fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ userId, classId }),
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());
}
