(() => {
  const page = document.querySelector('#wrap:not(.index)');
  if (!page || !('WebGLRenderingContext' in window)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const startScene = async () => {
    try {
      const THREE = await import('three');
      const canvas = document.createElement('canvas');
      canvas.className = 'scroll-scene';
      canvas.setAttribute('aria-hidden', 'true');

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 0);
      document.body.insertBefore(canvas, page);
      document.body.classList.add('has-scroll-scene');

      const scene = new THREE.Scene();
      const viewHeight = 10;
      const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 40);
      camera.position.z = 20;

      const palette = getComputedStyle(document.documentElement);
      const colors = {
        forest: palette.getPropertyValue('--forest').trim(),
        sage: palette.getPropertyValue('--sage').trim(),
        clay: palette.getPropertyValue('--clay').trim(),
        gold: palette.getPropertyValue('--gold').trim(),
      };

      const makeMaterial = (color, opacity) => new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      });

      const primary = new THREE.Group();
      const secondary = new THREE.Group();
      scene.add(primary, secondary);

      const rings = [
        [2.3, 0.018, colors.forest, 0.25, 0.2, 0],
        [1.65, 0.015, colors.clay, 0.85, 0.45, 0.72],
        [1.02, 0.014, colors.gold, 0.35, 0.95, 1.35],
      ];

      rings.forEach(([radius, thickness, color, x, y, z]) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius, thickness, 8, 96),
          makeMaterial(color, 0.22),
        );
        ring.rotation.set(x, y, z);
        primary.add(ring);
      });

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.54, 1),
        new THREE.MeshBasicMaterial({
          color: colors.sage,
          wireframe: true,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        }),
      );
      primary.add(core);

      const satellites = new THREE.Group();
      primary.add(satellites);
      [0, 1, 2, 3].forEach((index) => {
        const angle = (index / 4) * Math.PI * 2;
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 10, 8),
          makeMaterial([colors.clay, colors.gold, colors.sage, colors.forest][index], 0.48),
        );
        marker.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0);
        satellites.add(marker);
      });

      const echo = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.018, 8, 72),
        makeMaterial(colors.sage, 0.16),
      );
      echo.rotation.set(0.8, 0.3, -0.5);
      secondary.add(echo);

      let targetProgress = getScrollProgress();
      let frame = 0;
      let lastFrameTime = 0;
      let animationTime = 0;

      const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        const halfWidth = (viewHeight * aspect) / 2;

        camera.left = -halfWidth;
        camera.right = halfWidth;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);

        const compact = width < 700;
        primary.position.set(halfWidth * (compact ? 0.27 : 0.32), 0.12, 0);
        primary.scale.setScalar(compact ? 0.62 : 1);
        secondary.position.set(-halfWidth * 0.34, -viewHeight * 0.28, -0.2);
        secondary.scale.setScalar(compact ? 0.52 : 0.85);
        renderer.render(scene, camera);
      };

      function getScrollProgress() {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        return distance > 0 ? window.scrollY / distance : 0;
      }

      const draw = (time = 0) => {
        frame = 0;
        if (document.visibilityState === 'hidden') return;

        if (!reducedMotion && lastFrameTime) {
          animationTime += (time - lastFrameTime) / 1000;
        }
        lastFrameTime = time;

        const progress = targetProgress;
        const scrollRotation = progress * 0.25;
        const targetRotation = {
          x: 0.24 + scrollRotation * Math.PI * 2,
          y: 0.32 + scrollRotation * Math.PI * 1.5,
          z: -0.12 - scrollRotation * Math.PI,
          secondaryZ: 0.18 - scrollRotation * Math.PI * 1.5,
        };
        if (reducedMotion) {
          primary.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
          secondary.rotation.z = targetRotation.secondaryZ;
        } else {
          primary.rotation.x = targetRotation.x + animationTime * 0.045;
          primary.rotation.y = targetRotation.y + animationTime * 0.1;
          primary.rotation.z = targetRotation.z + animationTime * 0.025;
          secondary.rotation.z = targetRotation.secondaryZ - animationTime * 0.07;
        }
        satellites.rotation.z = -primary.rotation.y * 0.45;
        renderer.render(scene, camera);

        if (!reducedMotion) frame = window.requestAnimationFrame(draw);
      };

      const scheduleDraw = () => {
        targetProgress = getScrollProgress();
        if (reducedMotion) {
          draw(0);
        } else if (!frame && document.visibilityState === 'visible') {
          frame = window.requestAnimationFrame(draw);
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          window.cancelAnimationFrame(frame);
          frame = 0;
          return;
        }
        lastFrameTime = 0;
        scheduleDraw();
      };

      resize();
      if (reducedMotion) {
        canvas.classList.add('is-visible');
      } else {
        window.requestAnimationFrame(() => canvas.classList.add('is-visible'));
      }
      scheduleDraw();

      if (!reducedMotion) window.addEventListener('scroll', scheduleDraw, { passive: true });
      window.addEventListener('resize', resize, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pageshow', handleVisibilityChange);
      window.addEventListener('pagehide', (event) => {
        if (event.persisted) return;
        window.cancelAnimationFrame(frame);
        scene.traverse((object) => {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material?.dispose();
          }
        });
        renderer.dispose();
      });
    } catch (error) {
      // The decorative background is optional; page content remains fully usable.
      console.warn('Scroll scene could not be initialized.', error);
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startScene, { timeout: 1600 });
  } else {
    window.setTimeout(startScene, 200);
  }
})();
