#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const profilesDirectory = `${os.homedir()}/Library/Application Support/librewolf/Profiles/`;
const overrideLocation  = `${os.homedir()}/.librewolf/`;

if('darwin' !== os.platform()) {
  console.error('This script only works on MacOS.');
  process.exit();
}

const getAppPrefDirectory = () => {
  const apps = fs.readdirSync();
  console.log(apps);
};

const getProfileDirectory = () => {

  const directoryListing = fs.readdirSync(profilesDirectory);
  let profileDirectory;

  directoryListing.forEach(listing => {
    if(-1 === listing.indexOf('default-default')) {
      return;
    }

    profileDirectory = `${profilesDirectory}${listing}`;
  });

  return profileDirectory;
};

fs.cpSync('../librewolf/profile', getProfileDirectory(), {recursive: true});
fs.mkdirSync(overrideLocation, {recursive: true});
fs.copyFileSync('../librewolf/prefs/override.cfg.js', `${overrideLocation}librewolf.overrides.cfg`);
