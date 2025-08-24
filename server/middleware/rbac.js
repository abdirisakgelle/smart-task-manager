// Simple RBAC middleware
// Usage: rbac({ allow: ['admin','manager','media'] })

const roleRanks = {
	admin: 3,
	manager: 2,
	media: 1,
	user: 0,
};

function rbac({ allow = [] } = {}) {
	return (req, res, next) => {
		const user = req.user || {};
		const role = user.role || 'user';
		if (allow.includes(role)) {
			return next();
		}
		return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient role' });
	};
}

module.exports = { rbac, roleRanks };