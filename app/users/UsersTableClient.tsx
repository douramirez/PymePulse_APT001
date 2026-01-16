"use client";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string | Date;
};

export default function UsersTableClient({ users }: { users: UserRow[] }) {
  async function toggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d?.error ?? "Error");
      return;
    }

    window.location.reload();
  }

  return (
    <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Nombre</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Email</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Rol</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Estado</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Acción</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{u.name}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{u.email}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{u.role}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
              {u.isActive ? "Activo" : "Inactivo"}
            </td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
              {u.isActive ? (
                <button
                  onClick={() => toggle(u.id, false)}
                  style={{ border: "1px solid #000", borderRadius: 8, padding: "6px 10px" }}
                >
                  Desactivar
                </button>
              ) : (
                <button
                  onClick={() => toggle(u.id, true)}
                  style={{ border: "1px solid #000", borderRadius: 8, padding: "6px 10px" }}
                >
                  Activar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
