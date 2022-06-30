#!/usr/bin/env node
const fs = require('fs');
const os = require('os');

if('darwin' !== os.platform()) {
  console.error('This script only works on MacOS.');
  process.exit();
}

const profilesDirectory = `${os.homedir()}/Library/Application Support/librewolf/Profiles/`;

const directoryListing = fs.readdirSync(profilesDirectory);
let extensionsDirectory;

directoryListing.forEach(listing => {
  if(-1 === listing.indexOf('default-default')) {
    return;
  }

  extensionsDirectory = `${profilesDirectory}${listing}/extensions`;
});

fs.cpSync('../../', extensionsDirectory+'/t1eb4n', {recursive: true});