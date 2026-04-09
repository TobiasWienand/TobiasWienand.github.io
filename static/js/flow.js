(function() {
    var fc = document.getElementById('flow-canvas');
    if (!fc) return;
    var fctx = fc.getContext('2d');
    var fw, fh;

    function resizeFlow() {
        fw = fc.width = window.innerWidth;
        fh = fc.height = window.innerHeight;
    }
    resizeFlow();
    window.addEventListener('resize', resizeFlow);

    var noiseGrid = {};
    function seedNoise() {
        for (var x = 0; x < 200; x++) {
            for (var y = 0; y < 200; y++) {
                noiseGrid[x + ',' + y] = Math.random();
            }
        }
    }
    seedNoise();

    function lerp(a, b, t) { return a + (b - a) * t; }
    function smoothstep(t) { return t * t * (3 - 2 * t); }

    function noise2d(x, y) {
        var ix = Math.floor(x) % 200;
        var iy = Math.floor(y) % 200;
        if (ix < 0) ix += 200;
        if (iy < 0) iy += 200;
        var fx = x - Math.floor(x);
        var fy = y - Math.floor(y);
        fx = smoothstep(fx);
        fy = smoothstep(fy);
        var nx = (ix + 1) % 200;
        var ny = (iy + 1) % 200;
        var v00 = noiseGrid[ix + ',' + iy] || 0;
        var v10 = noiseGrid[nx + ',' + iy] || 0;
        var v01 = noiseGrid[ix + ',' + ny] || 0;
        var v11 = noiseGrid[nx + ',' + ny] || 0;
        return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
    }

    var flowParticles = [];
    var FLOW_COUNT = 150;

    function createFlowParticle() {
        return {
            x: Math.random() * fw,
            y: Math.random() * fh,
            age: 0,
            maxAge: 120 + Math.random() * 180,
            speed: 0.3 + Math.random() * 0.5,
            hue: Math.random() > 0.6 ? 0 : 1
        };
    }

    for (var i = 0; i < FLOW_COUNT; i++) {
        flowParticles.push(createFlowParticle());
    }

    var flowTime = 0;

    function drawFlow() {
        fctx.fillStyle = 'rgba(10, 10, 10, 0.025)';
        fctx.fillRect(0, 0, fw, fh);
        flowTime += 0.0015;

        for (var i = 0; i < flowParticles.length; i++) {
            var p = flowParticles[i];
            var scale = 0.004;
            var n = noise2d(p.x * scale + flowTime, p.y * scale + flowTime);
            var angle = n * Math.PI * 4;

            p.x += Math.cos(angle) * p.speed;
            p.y += Math.sin(angle) * p.speed;
            p.age++;

            var lifeRatio = p.age / p.maxAge;
            var alpha = Math.sin(lifeRatio * Math.PI) * 0.35;

            if (p.hue === 0) {
                fctx.fillStyle = 'rgba(0, 204, 136, ' + alpha + ')';
            } else {
                fctx.fillStyle = 'rgba(0, 160, 110, ' + alpha * 0.7 + ')';
            }

            fctx.beginPath();
            fctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
            fctx.fill();

            if (p.age > p.maxAge || p.x < -20 || p.x > fw + 20 || p.y < -20 || p.y > fh + 20) {
                flowParticles[i] = createFlowParticle();
            }
        }
        requestAnimationFrame(drawFlow);
    }
    drawFlow();

    // Scroll reveal
    var sections = document.querySelectorAll('.section');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(function(s) {
        s.style.opacity = '0';
        s.style.transform = 'translateY(12px)';
        s.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(s);
    });
})();
