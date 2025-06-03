This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.


# Proyecto Backend de Recomendaciones de Películas

Este documento explica cómo configurar un entorno virtual para este proyecto backend de Python y cómo ejecutar la aplicación en diferentes sistemas operativos.

## Prerrequisitos

Asegúrate de tener Python 3 instalado en tu sistema. Puedes verificar la instalación abriendo la terminal (o el símbolo del sistema en Windows) y ejecutando:

```bash
python --version
# o
python3 --version

```


# Configuración del Entorno Virtual con venv

venv es un módulo incorporado en Python 3 que se utiliza para crear entornos virtuales ligeros.

1. Crear el Entorno Virtual:

Abre tu terminal o símbolo del sistema, navega hasta el directorio raíz de tu proyecto backend (donde se encuentra el archivo requirements.txt) y ejecuta el siguiente comando:


# Para Linux y macOS
```bash
python3 -m venv virEnv
```

# Para Windows

```bash
python -m venv virEnv
```
Esto creará un directorio llamado virEnv (o el nombre que prefieras) que contendrá una copia aislada de Python y las herramientas de instalación de paquetes.

# 2. Activar el Entorno Virtual:

Debes activar el entorno virtual antes de instalar las dependencias y ejecutar la aplicación. El comando para activar el entorno virtual varía según tu sistema operativo:

Linux y macOS:

    source virEnv/bin/activate

Una vez activado, verás el nombre del entorno virtual ((virEnv)) al principio de tu línea de comandos.

Windows (Símbolo del sistema - cmd.exe):

    .\virEnv\Scripts\activate

Windows (PowerShell):

    .\virEnv\Scripts\Activate.ps1

    Al igual que en Linux y macOS, verás (virEnv) al inicio de tu prompt.

# 3. Instalar las Dependencias:

Con el entorno virtual activado, navega (si aún no estás allí) al directorio raíz de tu proyecto y ejecuta el siguiente comando para instalar todas las bibliotecas necesarias listadas en el archivo requirements.txt:

    pip install -r requirements.txt

Esto descargará e instalará todas las dependencias especificadas en el archivo requirements.txt dentro de tu entorno virtual aislado.

# Ejecución del Backend

Una vez que hayas activado el entorno virtual e instalado las dependencias, puedes ejecutar la aplicación backend de FastAPI utilizando uvicorn. Asegúrate de estar en el directorio raíz de tu proyecto (donde se encuentra el archivo backend/main.py).

Ejecuta el siguiente comando:

    uvicorn backend.main:app --reload

Después de ejecutar este comando, deberías ver un mensaje indicando que Uvicorn está corriendo en http://127.0.0.1:8000 (o alguna otra dirección). Esto significa que tu backend está en funcionamiento y listo para recibir solicitudes.

Desactivar el Entorno Virtual (Opcional)

Cuando termines de trabajar en el proyecto, puedes desactivar el entorno virtual ejecutando el siguiente comando en tu terminal:

    deactivate