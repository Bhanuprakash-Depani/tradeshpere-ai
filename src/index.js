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

import { TradeSphereSystem } from './tradesphere.js';

const assets = {
  environmentDesk: {
    url: './gltf/environmentDesk/environmentDesk.gltf',
    type: AssetType.GLTF,
    priority: 'critical'
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
  
  
  camera.position.set(-4, 1.5, -6);
  camera.rotateY(-Math.PI * 0.75);
  

  
  
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
      maxWidth: 0.8,
      maxHeight: 1.0,
      density: 2000
    });
  leftPanel.object3D.position.set(-1.2, 1.3, -1.5);
  leftPanel.object3D.rotation.y = Math.PI / 6; // Angle towards user

  // Center Panel: Graph
  const centerPanel = world
    .createTransformEntity()
    .addComponent(Interactable)
    .addComponent(PanelUI, {
      config: './ui/center-panel.json',
      maxWidth: 1.2,
      maxHeight: 0.8,
      density: 2000
    });
  centerPanel.object3D.position.set(0, 1.3, -1.8);

  // Right Panel: AI Insights
  const rightPanel = world
    .createTransformEntity()
    .addComponent(Interactable)
    .addComponent(PanelUI, {
      config: './ui/right-panel.json',
      maxWidth: 0.8,
      maxHeight: 1.0,
      density: 2000
    });
  rightPanel.object3D.position.set(1.2, 1.3, -1.5);
  rightPanel.object3D.rotation.y = -Math.PI / 6; // Angle towards user

  world.registerSystem(TradeSphereSystem);
});
