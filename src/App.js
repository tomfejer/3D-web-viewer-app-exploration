// import "./styles.css";
import CustomCursor from "./custom_cursor.svg";
import styled, { createGlobalStyle } from "styled-components";
import React, { Suspense, useRef, useState } from "react";
import * as THREE from "three";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Outline, Bloom } from "@react-three/postprocessing";
import {
  Box,
  OrbitControls,
  softShadows,
  Environment,
  Float,
  ContactShadows,
  Stage,
  PresentationControls,
  Edges
} from "@react-three/drei";

import { BlendFunction, Resizer } from "postprocessing";

import { FlakesTexture } from "./FlakesTexture.js";

const texture = new THREE.CanvasTexture(new FlakesTexture());
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.x = 10;
texture.repeat.y = 6;

const MaterialOutlineProperties = {
  color: "#1f1f1f"
};

const MaterialBlackMagiclackMagicProperties = {
  color: "black",
  emissive: "black",
  roughness: 0.5,
  metalness: 0.9,
  reflectivity: 0.5,
  clearcoat: 1.0,
  cleacoatRoughness: 0.1,
  flatShading: false,
  wireframe: false,
  vertexColors: false,
  fog: false,

  normalMap: texture,
  normalScale: new THREE.Vector2(0.15, 0.15)
};

const MaterialOutline = new THREE.MeshPhysicalMaterial(
  MaterialOutlineProperties
);
const MaterialBlackMagic = new THREE.MeshPhysicalMaterial(
  MaterialBlackMagiclackMagicProperties
);

const TorusGeometry = new THREE.TorusGeometry(3, 1.5, 56, 56);
const BoxGeometry = new THREE.BoxGeometry(5, 5, 5);
const CylinderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 4.5, 48, 48);
const ConeGeometry = new THREE.ConeGeometry(3, 4.5, 48, 48);
const OctahedronGeometry = new THREE.OctahedronGeometry(3, 0);
const DodecahedronGeometry = new THREE.DodecahedronGeometry(3, 0);
const IcosahedronGeometry = new THREE.IcosahedronGeometry(3, 0);
const SphereGeometry = new THREE.SphereGeometry(3, 56, 56);
const TetrahedronGeometry = new THREE.TetrahedronGeometry(3, 0);

const GlobalStyle = createGlobalStyle`
  html, body, * {
    margin: 0;
    padding: 0;
  }

/* @media (prefers-color-scheme: dark){ */
  :root{
    --keyColor: #fa586a;
    --sidebar: rgba(235, 235, 245, 0.03);
    /* --sidebar: red; */
    --sidebarBorderRule: rgba(255, 255, 255, 0.1);
    --systemPrimary: rgba(255, 255, 255, 0.92);
    --systemPrimary-vibrant: #f5f5f7;
    --systemPrimary-vibrant-rgb: 245,245,247;
    --systemPrimary-onLight: rgba(0, 0, 0, 0.88);
    --systemPrimary-onDark: rgba(255, 255, 255, 0.92);
    --systemSecondary: rgba(255, 255, 255, 0.64);
    --systemSecondary-vibrant: #a1a1a6;
    --systemSecondary-onLight: rgba(0, 0, 0, 0.56);
    --systemSecondary-onDark: rgba(255, 255, 255, 0.64);
    --systemTertiary: rgba(255, 255, 255, 0.4);
    --systemTertiary-vibrant: #6e6e73;
    --systemTertiary-onLight: rgba(0, 0, 0, 0.48);
    --systemTertiary-onDark: rgba(255, 255, 255, 0.4);
    --systemQuinary: rgba(255, 255, 255, 0.05);

    --dialogShadowColor: rgba(0, 0, 0, 0.55);
  }


body {
    background-color: #1f1f1f!important;
    font-family: -apple-system, "system-ui", "Apple Color Emoji", "SF Pro", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    font-synthesis: none;
}
/* } */

/* @media only screen and (min-width: 10px){ */

:root {
    --web-navigation-width: 260px;
}
/* } */

.switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;

}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0px 11px 11px rgba(0, 0, 0, 0.1), inset 0px 0px 1.5px rgba(255, 255, 255, 0.5); 
  border-radius: 34px;
  -webkit-transition: 0.3s ;
  transition: 0.3s ;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 1px;
  bottom: 1px;
  background-color: #C9C9C9;
  box-shadow: inset 0px 0.5px 0.5px rgba(255, 255, 255, 0.33);
  border-radius: 50%;
  -webkit-transition: 0.3s ;
  transition: 0.3s ;
}

input:checked + .slider {
  background-color: rgba(54, 122, 246, 1);
}

input:focus + .slider {
  box-shadow: 0 0 1px rgba(0,0,0,0.2);
}

input:checked + .slider:before {
  -webkit-transform: translateX(17px);
  -ms-transform: translateX(17px);
  transform: translateX(17px);
}

`;

const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: var(--web-navigation-width);
  background: transparent;
  cursor: url(${CustomCursor}) 4 4, auto;
`;

const Sidebar = styled.div`
  position: absolute;
  right: 0;
  height: 100%;
  width: var(--web-navigation-width);
  min-width: var(--web-navigation-width);
  max-width: var(--web-navigation-width);
  background-color: var(--sidebar);
  border-inline-start-color: var(--sidebarBorderRule);
  border-inline-start-style: solid;
  border-inline-start-width: 1px;
  z-index: 9890;
`;

const SectionTitle = styled.div`
  color: var(--systemPrimary);
  font-size: 13px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: 0;
  user-select: none;
  -webkit-user-drag: none;
  padding: 0;

  box-sizing: border-box;
  vertical-align: top;
  margin-block-start: 1.66em;
  margin-block-end: 0.32em;

  -webkit-margin-start: 25px;
  margin-inline-start: 25px;
  -webkit-margin-end: 25px;
  margin-inline-end: 25px;

  cursor: default;
`;

const SelectMenuContainer = styled.div`
  /* background: tomato; */
  z-index: 0;

  :hover::before {
    opacity: 1;
  }

  ::before {
    opacity: 0;
    content: "";
    position: absolute;
    width: calc(100% - 14px);
    transform: translate(7px, 2px);
    height: 25px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
    box-sizing: border-box;
    border-radius: 5px;
    z-index: 0;

    transition: opacity 0.2s ease-in;
  }
`;

const SelectMenu = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  width: calc(100% - 4px);

  color: var(--systemSecondary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.03em;

  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0);
  box-sizing: border-box;
  border-radius: 5px;

  margin-inline-start: 10px;
  margin-inline-end: 20px;
  padding: 5px 0px 5px 15px;

  outline: solid 1px rgba(255, 255, 255, 0);
  transition: outline 0.1s ease-in, border 0.1s ease-in;

  cursor: pointer;
  z-index: 100;

  :hover {
    border: 1px solid rgba(255, 255, 255, 0);

    /* -webkit-appearance: menulist; */
  }

  :focus-visible {
    outline: solid 1px rgba(0, 0, 0, 0);
    /* background-color: rgba(40,40,40,0.7); */
    /* background: rgba(40, 40, 40, 1); */
    /* backdrop-filter: blur(60px) saturate(2.1); */
    /* box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2); */
  }
`;

const Paragraph = styled.p`
  color: var(--systemTertiary);
  font-size: 13px;
  line-height: 1.25;
  font-weight: 400;
  letter-spacing: 0;
  user-select: none;
  -webkit-user-drag: none;
  padding: 0;

  -webkit-margin-start: 25px;
  margin-inline-start: 25px;
  -webkit-margin-end: 25px;
  margin-inline-end: 25px;
`;

const ButtonGroup = styled.div`
  display: flex;
  -webkit-margin-start: 25px;
  margin-inline-start: 25px;
  -webkit-margin-end: 25px;
  margin-inline-end: 25px;
  padding-top: 5px;
`;

const DefaultButton = styled.button`
  appearance: none;
  background: 0 0;
  border: none;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  height: 28px;
  padding-inline-start: 12px;
  padding-inline-end: 12px;
  background-color: var(--systemQuinary);
  transition: background-color 0.1s ease-in;

  min-width: 100px;
  border-radius: 6px;
  flex-shrink: 0;

  margin-inline-end: 5px;
`;

const Switch = styled.div`
  display: flex;
  flex-direction: row;
  color: white;
  width: 100%;
  /* background: tomato; */
  padding: 12px 25px;
`;

const SwitchLabel = styled.span`
  position: absolute;
  width: calc(var(--web-navigation-width) - 25px - 25px - 4px - 38px);
  /* background: red; */
  margin-left: calc(38px + 6px);
  line-height: 22px;

  color: var(--systemTertiary);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  user-select: none;
  -webkit-user-drag: none;
  padding: 0;
`;

function LineSegments(props) {
  const isLineSegments = props.isLineSegments;
  const edges = props.edges;
  if (isLineSegments) {
    return (
      <lineSegments geometry={edges} renderOrder={10}>
        <lineBasicMaterial color="#6F6F6F" />
      </lineSegments>
    );
  }
  return null;
}

function OutlineEffect(props) {
  const isOutlineEffect = props.isOutlineEffect;
  // const ref = props.ref;
  // const ref = useRef();
  // const refProp = props.ref;

  if (isOutlineEffect) {
    return (
      <Outline
        blur
        // selection={ref}
        visibleEdgeColor="white"
        edgeStrength={5}
        blendFunction={BlendFunction.SCREEN} // set this to BlendFunction.ALPHA for dark outlines. otherwise SCREEN
        width={Resizer.AUTO_SIZE} // render width
        height={Resizer.AUTO_SIZE} // render height
      />
    );
  }
  return null;
}

export default function App() {
  const ref = useRef();

  const BasicShapes = [
    TorusGeometry,
    BoxGeometry,
    CylinderGeometry,
    ConeGeometry,
    OctahedronGeometry,
    DodecahedronGeometry,
    IcosahedronGeometry,
    SphereGeometry,
    TetrahedronGeometry
  ];

  const MaterialList = [MaterialBlackMagic, MaterialOutline];

  const EnvironmentList = [
    "sunset",
    "dawn",
    "night",
    "warehouse",
    "forest",
    "apartment",
    "studio",
    "city",
    "park",
    "lobby"
  ];

  const [items, setItems] = useState(0);
  const [materials, setMaterials] = useState(0);
  const [environments, setEnvironments] = useState(0);

  const [isOutlineEffect, setOutlineEffect] = useState(false);

  function toggle(value) {
    return !value;
  }

  const edges = new THREE.EdgesGeometry(BasicShapes[items]);

  const [geometryTypes, setgeometryTypes] = useState([
    "Torus",
    "Box",
    "Cylinder",
    "Cone",
    "Octahedron",
    "Dodecahedron",
    "Icosahedron",
    "Sphere",
    "Tetrahedron"
  ]);

  const [materialTypes, setMaterialTypes] = useState(["Black magic", "Clay"]);

  const [environmentTypes, setEnvironmentTypes] = useState([
    "Sunset",
    "Dawn",
    "Night",
    "Warehouse",
    "Forest",
    "Apartment",
    "Studio",
    "City",
    "Park",
    "Lobby"
  ]);

  const GeometryType = geometryTypes.map((GeometryType) => GeometryType);
  const MaterialType = materialTypes.map((MaterialType) => MaterialType);
  const EnvironmentType = environmentTypes.map(
    (EnvironmentType) => EnvironmentType
  );

  const handleTypesChange = (e) => {
    setItems(e.target.value);
  };

  const handleMaterialChange = (e) => {
    setMaterials(e.target.value);
  };

  const handleEnvironmentChange = (e) => {
    setEnvironments(e.target.value);
  };

  return (
    <div>
      <Sidebar>
        <SectionTitle>Geometry</SectionTitle>
        <SelectMenuContainer>
          <SelectMenu onChange={(e) => handleTypesChange(e)}>
            {GeometryType.map((address, key) => (
              <option key={key} value={key}>
                {address}
              </option>
            ))}
          </SelectMenu>
        </SelectMenuContainer>
        <SectionTitle>Material</SectionTitle>
        {/* <ButtonGroup>
          <DefaultButton
            onClick={() => {
              setMaterials(MaterialOutline);
            }}
          >
            Grey clay
          </DefaultButton>
          <DefaultButton
            onClick={() => {
              setMaterials(MaterialBlackMagic);
            }}
          >
            Black magic
          </DefaultButton>
        </ButtonGroup> */}
        <SelectMenuContainer>
          <SelectMenu onChange={(e) => handleMaterialChange(e)}>
            {MaterialType.map((address, key) => (
              <option key={key} value={key}>
                {address}
              </option>
            ))}
          </SelectMenu>
        </SelectMenuContainer>
        <Switch>
          <label class="switch">
            <input
              type="checkbox"
              checked={isOutlineEffect}
              onChange={(e) => setOutlineEffect(toggle)}
            />
            <span class="slider round"></span>
            <SwitchLabel>Outline and wireframe</SwitchLabel>
          </label>
        </Switch>
        <SectionTitle>Environment</SectionTitle>
        <SelectMenuContainer>
          <SelectMenu onChange={(e) => handleEnvironmentChange(e)}>
            {EnvironmentType.map((address, key) => (
              <option key={key} value={key}>
                {address}
              </option>
            ))}
          </SelectMenu>
        </SelectMenuContainer>
        <SectionTitle>Export</SectionTitle>
        <Paragraph>Coming probably later...</Paragraph>
      </Sidebar>
      <CanvasContainer>
        <Suspense fallback={null}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 17], fov: 50 }}
            gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
          >
            <ambientLight intensity={0.25} />
            <directionalLight intensity={0.5} castShadow />
            {/* <color attach="background" args={['#000']} /> */}
            {/* <PresentationControls
              global
              zoom={0.8}
              rotation={[0, -Math.PI / 4, 0]}
              polar={[0, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            > */}
            {/* <Stage
              contactShadow
              shadows
              adjustCamera
              intensity={0.5}
              environment="sunset"
              // Preset must be one of: sunset, dawn, night, warehouse, forest, apartment, studio, city, park, lobby
              preset="rembrandt"
            > */}
            <Float>
              <mesh
                ref={ref}
                castShadow
                receiveShadow
                geometry={BasicShapes[items]}
                material={MaterialList[materials]}
              ></mesh>
              {/* <mesh>
                <torusGeometry />
                <meshBasicMaterial />
                <Edges
                  scale={1}
                  threshold={1} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
                  color="red"

                />
              </mesh> */}
              <LineSegments
                isLineSegments={isOutlineEffect ? true : false}
                edges={edges}
              />
            </Float>
            {/* </Stage> */}
            {/* </PresentationControls> */}
            {/* <ContactShadows rotation-x={Math.PI / 2} position={[0, -5, 0]} opacity={0.5} width={20} height={20} blur={1} far={5} /> */}

            <Environment
              // files="/adamsbridge.hdr"
              preset={EnvironmentList[environments]}
              // Preset must be one of: sunset, dawn, night, warehouse, forest, apartment, studio, city, park, lobby
            />
            <EffectComposer multisampling={42} autoClear={false}>
              <Outline
                blur
                selection={ref}
                visibleEdgeColor="white"
                edgeStrength={isOutlineEffect ? 100 : 0}
                blendFunction={BlendFunction.SCREEN} // set this to BlendFunction.ALPHA for dark outlines. otherwise SCREEN
                width={Resizer.AUTO_SIZE} // render width
                height={Resizer.AUTO_SIZE} // render height
              />
              {/* <OutlineEffect isOutlineEffect={true} ref={ref} /> */}
              <Bloom
                intensity={0.4}
                kernelSize={2}
                luminanceThreshold={0.8}
                luminanceSmoothing={0.0}
              />
            </EffectComposer>
            <OrbitControls makeDefault dampingFactor={0.3} />
          </Canvas>
        </Suspense>
      </CanvasContainer>
      <GlobalStyle />
    </div>
  );
}

softShadows();
