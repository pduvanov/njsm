#!/usr/bin/env node

/*
 * NJSM JavaScript build tool
 * Copyright 2021 Pavel Duvanov
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

const exit = require('exit');
const App = requireNjsmApp().App;

try {
  let app = new App();
  app.run((error) => {
    error ? fail(error) : exit(0);
  });
} catch(error) {
  fail(error);
}

function requireNjsmApp() {
  // Try to load a local njsm
  try {
    return require(`${process.cwd()}/node_modules/app`);
  }
  // If that fails, likely running globally
  catch(e) {
    return require('../lib/app');
  }
}

function fail(error) {
  if (error instanceof Error) {
    if (error.stack) {
      console.error(error.stack);
    } else {
      console.error(error.message);
    }
  } else {
    console.error(error.toString());
  }
  exit(1);
}
