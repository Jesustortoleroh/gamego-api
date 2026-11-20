const notBuilt = (req, res) =>
  res.status(501).json({ message: `${req.method} ${req.originalUrl} is planned but not built yet.` });

export const login = (req, res) => {
  // #swagger.summary = 'Log in with GitHub'
  notBuilt(req, res);
};

export const callback = (req, res) => {
  // #swagger.summary = 'GitHub login callback'
  notBuilt(req, res);
};

export const me = (req, res) => {
  // #swagger.summary = 'Get the logged-in user'
  notBuilt(req, res);
};

export const logout = (req, res) => {
  // #swagger.summary = 'Log out'
  notBuilt(req, res);
};
