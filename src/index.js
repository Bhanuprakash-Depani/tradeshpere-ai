import {
  AssetType,
  SessionMode,
  AssetManager,
  World
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
} from '@iwsdk/core';


import { EnvironmentType, LocomotionEnvironment } from '@iwsdk/core';

import { TradeSphereSystem, TrendMascot } from './tradesphere.js';

const assets = {
  environmentDesk: {
    url: './gltf/environmentDesk/environmentDesk.gltf',
    type: AssetType.GLTF,
    priority: 'critical'
  },
  bull: {
    url: './gltf/bull/bull.gltf', // Placeholder path
    type: AssetType.GLTF,
    priority: 'background'
  },
  bear: {
    url: './gltf/bear/bear.gltf', // Placeholder path
    type: AssetType.GLTF,
    priority: 'background'
  }
};

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    // Optional structured features; layers/local-floor are offered by default
    features: { handTracking: true, layers: true } 
  },
  features: { locomotion: { useWorker: true }, grabbing: true, physics: false, sceneUnderstanding: false, environmentRaycast: false }  
}).then((world) => {
  const { camera } = world;
  
  
  camera.position.set(0, 1.6, 1.5);
  

  
  
  const { scene: envMesh } = AssetManager.getGLTF('environmentDesk');
  envMesh.rotateY(Math.PI);
  envMesh.position.set(0, -0.1, 0);
  world
    .createTransformEntity(envMesh)
    .addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  

  // --- TradeSphere UI Setup ---

  // Left Panel: Watchlist
  const leftPanel = world
    .createTransformEntity()
    .addComponent(Interactable)
    .addComponent(PanelUI, {
      config: './ui/left-panel.json',
      maxWidth: 0.9,
      maxHeight: 1.06,
      density: 3200
    });
  leftPanel.object3D.position.set(-1.48, 1.6, -1.16);
  leftPanel.object3D.lookAt(camera.position);

  // Center Panel: Graph
  const centerPanel = world
    .createTransformEntity()
    .addComponent(Interactable)
    .addComponent(PanelUI, {
      config: './ui/center-panel.json',
      maxWidth: 1.46,
      maxHeight: 0.96,
      density: 3200
    });
  centerPanel.object3D.position.set(0, 1.72, -1.18);
  centerPanel.object3D.lookAt(camera.position);

  // Right Panel: AI Insights
  const rightPanel = world
    .createTransformEntity()
    .addComponent(Interactable)
    .addComponent(PanelUI, {
      config: './ui/right-panel.json',
      maxWidth: 0.9,
      maxHeight: 1.06,
      density: 3200
    });
  rightPanel.object3D.position.set(1.48, 1.6, -1.16);
  rightPanel.object3D.lookAt(camera.position);

  // Trend Mascot Container
  const mascot = world.createTransformEntity();
  mascot.object3D.position.set(0, 0.9, -1.2); // Positioned on the desk
  mascot.object3D.scale.setScalar(0.5);
  mascot.addComponent(TrendMascot);

  world.registerSystem(TradeSphereSystem);
});
