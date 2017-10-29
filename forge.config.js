module.exports = {
  'make_targets': {
    'win32': ['squirrel'],
    'darwin': ['zip', 'dmg'],
    'linux': ['deb', 'rpm', 'flatpak']
  },
  'electronPackagerConfig': {},
  'electronWinstallerConfig': {},
  'electronInstallerDMG': {},
  'electronInstallerFlatpak': {},
  'electronInstallerDebian': {},
  'electronInstallerRedhat': {}
};
