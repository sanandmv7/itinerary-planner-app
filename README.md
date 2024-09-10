# Welcome to Itinerary Planner App 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Build APK

### Using EAS CLI

1. First, ensure you have the latest version of EAS CLI installed:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account in the terminal:

```bash
eas login
```

3. In your project directory, run:

```bash
eas build:configure
```

This will create an eas.json file in your project root if it doesn't exist already.

4. Open the eas.json file and add a profile for creating an APK. Your eas.json might look something like this:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview2": {
      "android": {
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "preview3": {
      "developmentClient": true
    },
    "production": {}
  }
}
```

5. Now, you can build your APK using the following command:

```
eas build -p android --profile preview
```

6. EAS Build will start the build process. This might take a while. Once it's done, you'll receive a link to download your APK.

### How build the APK locally?

1. Run the following command to generate the `android` directory:

```bash
npx expo prebuild
```

2. Go to `android` directory

```bash
cd android
```

3. Run the following command to generate the debug build:

```bash
./gradlew assembleDebug
```

You can find the generated apk file in `app/build/outputs/apk/debug` in the `android` directory

4. Run the following command to build the production build:

```bash
./gradlew assembleRelease
```

You can find the generated apk file in `app/build/outputs/apk/release` in the `android` directory

## Open Source License

Unless explicitly stated otherwise all files in this repository are licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0-standalone.html). All projects **must** properly attribute [The Original Source](https://github.com/sanandmv7/itinerary-planner-app).

    Itinerary Planner
    Copyright (C) 2024 sanandmv7

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

An unmodified copy of the above license text must be included in all forks.
