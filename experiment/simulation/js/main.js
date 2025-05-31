// Draw static pipe diagram
function drawStaticPipeDiagram() {
    const canvas = document.getElementById('staticPipeCanvas');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const centerY = canvas.height/2;
    
    // Draw pipe
    const pipeHeight = 60;
    const wallThickness = 4;
    
    // Get theme colors
    const style = getComputedStyle(document.documentElement);
    const bgColor = style.getPropertyValue('--static-diagram-bg').trim();
    const pipeWall = style.getPropertyValue('--static-pipe-wall').trim();
    const pipeWallDark = style.getPropertyValue('--static-pipe-wall-dark').trim();
    const waterColor = style.getPropertyValue('--static-water').trim();
    const tapColor = style.getPropertyValue('--static-tap-color').trim();
    const connectionColor = style.getPropertyValue('--static-connection').trim();
    const textColor = style.getPropertyValue('--text-primary').trim();
    const accentColor = style.getPropertyValue('--accent-color').trim();
    
    // Clear canvas with theme background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pipe background
    ctx.beginPath();
    ctx.rect(50, centerY - pipeHeight/2, canvas.width - 100, pipeHeight);
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Create water gradient
    const waterGradient = ctx.createLinearGradient(0, centerY - pipeHeight/2, 0, centerY + pipeHeight/2);
    waterGradient.addColorStop(0, waterColor);
    waterGradient.addColorStop(0.5, waterColor.replace(/[\d.]+\)$/, '0.4)'));
    waterGradient.addColorStop(1, waterColor);

    // Fill pipe with water gradient
    ctx.fillStyle = waterGradient;
    ctx.fill();
    
    // Draw pipe walls
    const gradient = ctx.createLinearGradient(
        0, centerY - pipeHeight/2 - wallThickness,
        0, centerY + pipeHeight/2 + wallThickness
    );
    gradient.addColorStop(0, pipeWall);
    gradient.addColorStop(0.5, pipeWallDark);
    gradient.addColorStop(1, pipeWall);
    
    // Top wall
    ctx.beginPath();
    ctx.rect(50, centerY - pipeHeight/2 - wallThickness, canvas.width - 100, wallThickness);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Bottom wall
    ctx.beginPath();
    ctx.rect(50, centerY + pipeHeight/2, canvas.width - 100, wallThickness);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw pipe ends
    ctx.beginPath();
    ctx.rect(50 - wallThickness, centerY - pipeHeight/2 - wallThickness, wallThickness, pipeHeight + wallThickness * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.rect(canvas.width - 50, centerY - pipeHeight/2 - wallThickness, wallThickness, pipeHeight + wallThickness * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw pressure taps
    drawStaticPressureTap(ctx, 150, centerY, pipeHeight, tapColor, connectionColor);
    drawStaticPressureTap(ctx, canvas.width - 150, centerY, pipeHeight, tapColor, connectionColor);
}

function drawStaticPressureTap(ctx, x, centerY, pipeHeight, tapColor, connectionColor) {
    const tapHeight = 30;
    
    // Draw tap pipe
    ctx.beginPath();
    ctx.moveTo(x, centerY - pipeHeight/2);
    ctx.lineTo(x, centerY - pipeHeight/2 - tapHeight);
    ctx.strokeStyle = tapColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw tap circle
    ctx.beginPath();
    ctx.arc(x, centerY - pipeHeight/2 - tapHeight, 6, 0, Math.PI * 2);
    ctx.fillStyle = tapColor;
    ctx.fill();
    
    // Draw connection point
    ctx.beginPath();
    ctx.arc(x, centerY - pipeHeight/2, 4, 0, Math.PI * 2);
    ctx.fillStyle = connectionColor;
    ctx.fill();
}

// Constants
const WATER_DENSITY = 998; // kg/m³
const WATER_VISCOSITY = 0.001; // Pa·s
const GRAVITY = 9.81; // m/s²

// Fluid properties
const FLUIDS = {
    water: { density: 998, viscosity: 0.001 },
    glycerin: { density: 1260, viscosity: 1.412 },
    oil: { density: 900, viscosity: 0.03 }
};

// Particle colors for different fluids
const PARTICLE_COLORS = {
    water: 'rgba(52, 152, 219, 0.8)',    // Blue
    oil: 'rgba(241, 196, 15, 0.8)',      // Yellow
    glycerin: 'rgba(255, 105, 180, 0.8)' // Pink
};

// Handle intro section transition
document.addEventListener('DOMContentLoaded', function() {
    // Draw the static pipe diagram
    drawStaticPipeDiagram();
    
    // Handle window resize for static diagram
    window.addEventListener('resize', drawStaticPipeDiagram);

    const startButton = document.getElementById('start-simulation');
    const introSection = document.getElementById('intro-section');
    const simulatorSection = document.getElementById('simulator-section');
    const popup = document.getElementById('input-parameter-popup');
    const popupOkBtn = document.getElementById('popup-ok-btn');

    startButton.addEventListener('click', function() {
        // Show popup
        popup.style.display = 'flex';
    });

    popupOkBtn.addEventListener('click', function() {
        // Hide popup and show simulator
        popup.style.display = 'none';
        introSection.style.display = 'none';
        simulatorSection.style.display = 'block';
        
        // Initialize and start simulator
        if (!window.simulator) {
            window.simulator = new PipeFlowSimulator();
        }
    });
});

class PipeFlowSimulator {
    constructor() {
        // Simulation state
        this.isRunning = false;
        this.needsUpdate = false;
        this.hasUserInput = false;
        
        // Initialize properties
        this.particles = [];
        this.headLossData = [];
        this.currentDiameter = 0.05;
        this.flowSpeed = 0;
        this.lastFrameTime = 0;
        this.simulationValues = {
            velocity: 0,
            headLoss: 0,
            frictionFactor: 0,
            reynolds: 0
        };
        
        // Initialize readings array
        this.readings = [];
        
        // Get and setup canvas
        this.setupCanvas();
        
        // Setup inputs and chart
        this.setupInputs();
        this.setupChart();
        
        // Initialize particles but don't start moving them
        this.initializeParticles();
        
        // Start animation loop but particles won't move until input changes
        this.startSimulation();

        // Initial update to show zero values
        this.updateSimulation();

        // Setup record and export buttons
        this.setupRecordingControls();
    }

    setupCanvas() {
        this.canvas = document.getElementById('pipeCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Add event listeners for window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup component hover detection
        this.setupComponentHover();
    }

    setupComponentHover() {
        this.tooltip = document.getElementById('component-tooltip');
        if (!this.tooltip) {
            console.error('Tooltip element not found');
            return;
        }

        // Component areas for hover detection
        this.components = [];
        
        // Mouse event listeners
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    }

    updateComponentAreas() {
        if (!this.canvas) return;
        
        const centerY = this.canvas.height / 2;
        const pipeHeight = Math.min(60 * (this.currentDiameter / 0.05), this.canvas.height * 0.6);
        const wallThickness = 4;
        
        this.components = [
            {
                name: "Pipe Inlet",
                description: "Water entry point",
                x: 50 - wallThickness,
                y: centerY - pipeHeight/2 - wallThickness,
                width: wallThickness + 20,
                height: pipeHeight + wallThickness * 2
            },
            {
                name: "Pipe Outlet", 
                description: "Water exit point",
                x: this.canvas.width - 70,
                y: centerY - pipeHeight/2 - wallThickness,
                width: wallThickness + 20,
                height: pipeHeight + wallThickness * 2
            },
            {
                name: "Pressure Tap 1",
                description: "Upstream pressure measurement point",
                x: 130,
                y: centerY - pipeHeight/2 - 40,
                width: 40,
                height: 50
            },
            {
                name: "Pressure Tap 2", 
                description: "Downstream pressure measurement point",
                x: this.canvas.width - 170,
                y: centerY - pipeHeight/2 - 40,
                width: 40,
                height: 50
            },
            {
                name: "Test Pipe Section",
                description: "Main pipe for friction loss measurement",
                x: 50,
                y: centerY - pipeHeight/2,
                width: this.canvas.width - 100,
                height: pipeHeight
            },
            {
                name: "Pipe Wall (Top)",
                description: "Upper pipe boundary",
                x: 50,
                y: centerY - pipeHeight/2 - wallThickness,
                width: this.canvas.width - 100,
                height: wallThickness
            },
            {
                name: "Pipe Wall (Bottom)",
                description: "Lower pipe boundary", 
                x: 50,
                y: centerY + pipeHeight/2,
                width: this.canvas.width - 100,
                height: wallThickness
            }
        ];
    }

    handleMouseMove(e) {
        if (!this.components || this.components.length === 0) {
            this.updateComponentAreas();
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Scale coordinates to canvas internal dimensions
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        // Check if mouse is over any component
        let foundComponent = null;
        for (const component of this.components) {
            if (canvasX >= component.x && 
                canvasX <= component.x + component.width &&
                canvasY >= component.y && 
                canvasY <= component.y + component.height) {
                foundComponent = component;
                break;
            }
        }
        
        if (foundComponent) {
            this.showTooltip(foundComponent, e.clientX, e.clientY);
        } else {
            this.hideTooltip();
        }
    }

    showTooltip(component, mouseX, mouseY) {
        if (!this.tooltip) return;
        
        this.tooltip.innerHTML = `
            <strong>${component.name}</strong><br>
            <span style="font-size: 0.8rem; opacity: 0.9;">${component.description}</span>
        `;
        
        // Position tooltip relative to the pipe visualization container
        const containerRect = this.canvas.parentElement.getBoundingClientRect();
        const x = mouseX - containerRect.left;
        const y = mouseY - containerRect.top;
        
        // Adjust position to keep tooltip in view
        const tooltipRect = this.tooltip.getBoundingClientRect();
        let finalX = x + 10;
        let finalY = y - 50;
        
        // Keep tooltip within container bounds
        if (finalX + tooltipRect.width > containerRect.width) {
            finalX = x - tooltipRect.width - 10;
        }
        if (finalY < 0) {
            finalY = y + 20;
            this.tooltip.classList.add('tooltip-bottom');
        } else {
            this.tooltip.classList.remove('tooltip-bottom');
        }
        
        this.tooltip.style.left = `${finalX}px`;
        this.tooltip.style.top = `${finalY}px`;
        this.tooltip.classList.add('visible');
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('visible');
        }
    }

    startSimulation() {
        console.log('Starting simulation...');
        this.isRunning = true;
        this.needsUpdate = true;
        this.updateSimulation();
        this.animate(0);
    }

    setupChart() {
        const ctx = document.getElementById('headLossGraph').getContext('2d');
        if (!ctx) return;

        // Get theme colors
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim();
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Head Loss vs Flow Velocity',
                    data: [],
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}33`,
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Flow Velocity (m/s)',
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Head Loss (m)',
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    updateSimulation() {
        if (!this.isRunning) return;

        try {
            // Get current values
            const L = parseFloat(this.lengthInput.value) || 5;
            const D = parseFloat(this.diameterInput.value) || 0.05;
            const Q = parseFloat(this.flowRateInput.value) || 0;
            const fluid = FLUIDS[this.fluidSelect.value] || FLUIDS.water;
            
            // Store current diameter for visualization
            this.currentDiameter = D;
            
            // Calculate flow parameters
            const A = Math.PI * Math.pow(D/2, 2);
            const Q_m3s = Q / 1000; // Convert L/s to m³/s
            const v = Q_m3s / A;
            
            // Calculate Reynolds number
            const Re = (fluid.density * v * D) / fluid.viscosity;
            
            // Calculate friction factor
            let f;
            if (Re < 2300) {
                f = 64 / Re; // Laminar flow
            } else {
                f = 0.316 * Math.pow(Re, -0.25); // Turbulent flow
            }
            
            // Calculate head loss
            const hf = f * (L/D) * Math.pow(v, 2) / (2 * GRAVITY);
            
            // Store values
            this.simulationValues = {
                velocity: v,
                headLoss: hf,
                frictionFactor: f,
                reynolds: Re
            };
            
            // Update displays
            this.updateDisplays();
            
            // Update flow speed for particles
            this.flowSpeed = v;
            
            // Update graph if velocity is valid
            if (v > 0 && isFinite(v) && isFinite(hf)) {
                this.updateGraph(v, hf);
            }
            
            this.needsUpdate = false;
            
        } catch (error) {
            console.error('Error updating simulation:', error);
        }
    }

    updateDisplays() {
        const { velocity, headLoss, frictionFactor } = this.simulationValues;
        
        // Update value displays with animation
        this.animateValue('velocity', velocity, 3);
        this.animateValue('headLoss', headLoss, 3);
        this.animateValue('frictionFactor', frictionFactor, 4);
        
        // Calculate pressures
        const fluid = FLUIDS[this.fluidSelect.value] || FLUIDS.water;
        const p1 = fluid.density * GRAVITY * headLoss;
        const p2 = 0;

        // Update pressure readings and meter
        this.updatePressureGauge('pressure1', p1);
        this.updatePressureGauge('pressure2', p2);
        this.updatePressureMeter(p1);
    }

    updateGraph(velocity, headLoss) {
        if (!this.chart) return;

        // Add new data point
        this.headLossData.push({ v: velocity, h: headLoss });
        
        // Keep only last 50 points
        if (this.headLossData.length > 50) {
            this.headLossData.shift();
        }
        
        // Sort data by velocity
        this.headLossData.sort((a, b) => a.v - b.v);
        
        // Update chart
        this.chart.data.labels = this.headLossData.map(d => d.v.toFixed(2));
        this.chart.data.datasets[0].data = this.headLossData.map(d => d.h);
        this.chart.update('none'); // Update without animation for smoother updates
    }

    animate(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = this.lastFrameTime ? timestamp - this.lastFrameTime : 16;
        this.lastFrameTime = timestamp;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipe
        this.drawPipe();
        
        // Update and draw particles if simulation is running
        if (this.isRunning) {
            this.updateParticles(deltaTime);
            this.drawParticles();
        }
        
        // Request next frame
        requestAnimationFrame((timestamp) => this.animate(timestamp));
    }

    setupInputs() {
        // Get input elements
        this.lengthInput = document.getElementById('pipeLength');
        this.diameterInput = document.getElementById('pipeDiameter');
        this.flowRateInput = document.getElementById('flowRate');
        this.fluidSelect = document.getElementById('fluid');
        this.flowRateValue = document.getElementById('flowRateValue');
        
        if (!this.lengthInput || !this.diameterInput || !this.flowRateInput || !this.fluidSelect) {
            console.error('Some input elements not found');
            return;
        }
        
        // Add event listeners
        const updateHandler = () => {
            this.hasUserInput = true;
            this.needsUpdate = true;
            requestAnimationFrame(() => this.updateSimulation());
        };

        // Update range slider filled track and value display
        const updateFlowRate = (e) => {
            const value = parseFloat(e.target.value);
            if (this.flowRateValue) {
                this.flowRateValue.textContent = value.toFixed(1);
            }
            this.flowSpeed = value;
            updateHandler();
        };

        this.lengthInput.addEventListener('input', updateHandler);
        this.diameterInput.addEventListener('input', updateHandler);
        this.flowRateInput.addEventListener('input', updateFlowRate);
        this.fluidSelect.addEventListener('change', updateHandler);

        // Initialize flow rate value display
        if (this.flowRateValue) {
            this.flowRateValue.textContent = (parseFloat(this.flowRateInput.value) || 0).toFixed(1);
        }
    }

    initializeParticles() {
        const particleCount = 200;
        this.particles = [];
        
        const centerY = this.canvas.height/2;
        const pipeHeight = Math.min(60 * (this.currentDiameter / 0.05), this.canvas.height * 0.6);
        const maxOffset = pipeHeight * 0.35;
        
        for (let i = 0; i < particleCount; i++) {
            const x = 70 + (i / particleCount) * (this.canvas.width - 140);
            this.particles.push({
                x: x,
                y: centerY + (Math.random() * 2 - 1) * maxOffset,
                size: 3.5,
                speed: 1 + Math.random() * 0.5,
                yOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    updateParticles(deltaTime) {
        if (!this.hasUserInput || this.flowSpeed === 0) return;
        
        const baseSpeed = Math.abs(this.flowSpeed) * 50;
        
        this.particles.forEach(particle => {
            particle.x += baseSpeed * particle.speed * (deltaTime / 16);
            particle.yOffset += deltaTime * 0.001;
            const oscillation = Math.sin(particle.yOffset) * 1;
            
            const pipeHeight = Math.min(60 * (this.currentDiameter / 0.05), this.canvas.height * 0.6);
            const maxOffset = pipeHeight * 0.35;
            const centerY = this.canvas.height / 2;
            
            particle.y += oscillation;
            particle.y = Math.max(
                centerY - maxOffset,
                Math.min(centerY + maxOffset, particle.y)
            );
            
            if (particle.x > this.canvas.width - 70) {
                particle.x = 70;
                particle.y = centerY + (Math.random() * 2 - 1) * maxOffset;
                particle.yOffset = Math.random() * Math.PI * 2;
            }
        });
    }
    
    drawPipe() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const centerY = this.canvas.height/2;
        const pipeHeight = Math.min(60 * (this.currentDiameter / 0.05), this.canvas.height * 0.6);
        const pipeLength = this.canvas.width - 100;
        const pipeX = 50;
        const wallThickness = 8;
        const endCapRadius = pipeHeight/2 + wallThickness;

        // 3D shadow below pipe
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(pipeX + pipeLength/2, centerY + pipeHeight/2 + 18, pipeLength/2.2, 12, 0, 0, 2 * Math.PI);
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#000';
        ctx.filter = 'blur(2px)';
        ctx.fill();
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        ctx.restore();

        // 3D pipe body (radial gradient)
        const grad = ctx.createLinearGradient(pipeX, centerY - pipeHeight/2, pipeX, centerY + pipeHeight/2);
        grad.addColorStop(0, '#444');
        grad.addColorStop(0.18, '#888');
        grad.addColorStop(0.5, '#e0e0e0');
        grad.addColorStop(0.82, '#888');
        grad.addColorStop(1, '#222');
        ctx.beginPath();
        ctx.rect(pipeX, centerY - pipeHeight/2 - wallThickness/2, pipeLength, pipeHeight + wallThickness);
        ctx.fillStyle = grad;
        ctx.fill();

        // Water inside pipe (with highlight)
        const waterGradient = ctx.createLinearGradient(pipeX, centerY - pipeHeight/2, pipeX, centerY + pipeHeight/2);
        waterGradient.addColorStop(0, 'rgba(30, 70, 160, 0.45)'); // Top dark blue
        waterGradient.addColorStop(0.4, 'rgba(30, 90, 180, 0.55)'); // Middle dark blue
        waterGradient.addColorStop(0.7, 'rgba(30, 90, 180, 0.62)'); // Deeper dark blue
        waterGradient.addColorStop(1, 'rgba(30, 70, 160, 0.45)'); // Bottom dark blue
        ctx.beginPath();
        ctx.rect(pipeX + wallThickness/2, centerY - pipeHeight/2 + wallThickness/2, pipeLength - wallThickness, pipeHeight - wallThickness);
        ctx.fillStyle = waterGradient;
        ctx.fill();

        // Pipe highlight (top)
        ctx.save();
        ctx.beginPath();
        ctx.rect(pipeX + 10, centerY - pipeHeight/2 - wallThickness/2 + 4, pipeLength - 20, 8);
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // Pipe shadow (bottom)
        ctx.save();
        ctx.beginPath();
        ctx.rect(pipeX + 10, centerY + pipeHeight/2 + wallThickness/2 - 12, pipeLength - 20, 8);
        ctx.globalAlpha = 0.13;
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // 3D end caps (left)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(pipeX, centerY, endCapRadius, pipeHeight/2 + wallThickness/2, 0, 0, 2 * Math.PI);
        const capGradL = ctx.createRadialGradient(pipeX - 2, centerY, 2, pipeX, centerY, endCapRadius);
        capGradL.addColorStop(0, '#fff');
        capGradL.addColorStop(0.2, '#bbb');
        capGradL.addColorStop(0.7, '#666');
        capGradL.addColorStop(1, '#222');
        ctx.fillStyle = capGradL;
        ctx.fill();
        ctx.restore();

        // 3D end caps (right)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(pipeX + pipeLength, centerY, endCapRadius, pipeHeight/2 + wallThickness/2, 0, 0, 2 * Math.PI);
        const capGradR = ctx.createRadialGradient(pipeX + pipeLength + 2, centerY, 2, pipeX + pipeLength, centerY, endCapRadius);
        capGradR.addColorStop(0, '#fff');
        capGradR.addColorStop(0.2, '#bbb');
        capGradR.addColorStop(0.7, '#666');
        capGradR.addColorStop(1, '#222');
        ctx.fillStyle = capGradR;
        ctx.fill();
        ctx.restore();

        // Draw pressure taps
        this.drawPressureTap(150, centerY, pipeHeight);
        this.drawPressureTap(this.canvas.width - 150, centerY, pipeHeight);

        // Store dimensions for particle animation
        this.pipeStartX = pipeX;
        this.pipeLength = pipeLength;
        
        // Update component areas for hover tooltips
        this.updateComponentAreas();
    }
    
    drawPressureTap(x, centerY, pipeHeight) {
        const ctx = this.ctx;
        const tapHeight = 30;
        
        // Get theme colors
        const pipeWall = getComputedStyle(document.documentElement).getPropertyValue('--pipe-wall').trim();
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        
        // Draw tap pipe
        ctx.beginPath();
        ctx.moveTo(x, centerY - pipeHeight/2);
        ctx.lineTo(x, centerY - pipeHeight/2 - tapHeight);
        ctx.strokeStyle = pipeWall;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw tap circle
        ctx.beginPath();
        ctx.arc(x, centerY - pipeHeight/2 - tapHeight, 6, 0, Math.PI * 2);
        ctx.fillStyle = pipeWall;
        ctx.fill();
        
        // Draw connection point with accent color
        ctx.beginPath();
        ctx.arc(x, centerY - pipeHeight/2, 4, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
    }
    
    drawParticles() {
        if (!this.ctx || !this.isRunning) return;

        // Get current fluid type and its color
        const fluidType = this.fluidSelect.value;
        const fluidColors = {
            water: 'rgba(52, 152, 219, 0.8)',    // Blue
            glycerin: 'rgba(255, 105, 180, 0.8)', // Pink
            oil: 'rgba(241, 196, 15, 0.8)'       // Yellow
        };
        const particleColor = fluidColors[fluidType] || fluidColors.water;
        const highlightColor = 'rgba(255, 255, 255, 0.4)';
            
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particleColor;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x - particle.size/3, particle.y - particle.size/3, particle.size/3, 0, Math.PI * 2);
            this.ctx.fillStyle = highlightColor;
            this.ctx.fill();
        });
    }
    
    animateValue(elementId, newValue, decimals = 2) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id ${elementId} not found`);
            return;
        }
        
        // Ensure the value is a valid number
        if (isNaN(newValue) || !isFinite(newValue)) {
            console.error(`Invalid value for ${elementId}:`, newValue);
            newValue = 0;
        }
        
        // Update the display
        element.textContent = newValue.toFixed(decimals);
        element.classList.remove('animate-value');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('animate-value');
    }
    
    updatePressureGauge(gaugeId, pressure) {
        const gauge = document.getElementById(gaugeId);
        if (!gauge) return;
        
        const valueSpan = gauge.querySelector('span');
        if (!valueSpan) return;
        
        // Ensure pressure is a valid number
        pressure = isNaN(pressure) ? 0 : Math.round(pressure);
        
        // Update value with animation
        valueSpan.textContent = pressure;
        gauge.classList.remove('updating');
        void gauge.offsetWidth; // Trigger reflow
        gauge.classList.add('updating');
        
        // Remove existing state classes
        gauge.classList.remove('success', 'warning', 'danger');
        
        // Color code based on pressure
        if (gaugeId === 'pressure1') {
            if (pressure > 1000) {
                gauge.classList.add('danger');
            } else if (pressure > 500) {
                gauge.classList.add('warning');
            } else {
                gauge.classList.add('success');
            }
        }
    }

    updatePressureMeter(pressure) {
        const meterValue = document.getElementById('inlet-pressure-value');
        if (!meterValue) return;
        
        // Update the value display
        meterValue.textContent = Math.round(pressure);
        meterValue.classList.add('updating');
        
        // Update color based on pressure range
        const meterBody = document.querySelector('.meter-body');
        if (meterBody) {
            meterBody.classList.remove('low', 'medium', 'high');
            if (pressure > 7500) {
                meterBody.classList.add('high');
            } else if (pressure > 3750) {
                meterBody.classList.add('medium');
            } else {
                meterBody.classList.add('low');
            }
        }
        
        // Remove animation class after transition
        setTimeout(() => {
            meterValue.classList.remove('updating');
        }, 300);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        this.canvas.width = container.offsetWidth;
        this.canvas.height = Math.max(200, container.offsetHeight);
        
        if (this.ctx) {
            this.drawPipe();
            this.drawParticles();
        }
    }

    setupRecordingControls() {
        const recordBtn = document.getElementById('record-reading');
        const exportBtn = document.getElementById('export-pdf');
        const stopBtn = document.getElementById('stop-simulator');
        const resetBtn = document.getElementById('reset-simulator');

        recordBtn.addEventListener('click', () => this.recordReading());
        exportBtn.addEventListener('click', () => this.exportToPDF());

        // Stop Simulator
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.isRunning = false;
                // Disable all inputs
                this.lengthInput.disabled = true;
                this.diameterInput.disabled = true;
                this.flowRateInput.disabled = true;
                this.fluidSelect.disabled = true;
                stopBtn.disabled = true;
                resetBtn.disabled = false;
            });
        }

        // Reset Simulator
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Reset all inputs to default values
                this.lengthInput.value = 5;
                this.diameterInput.value = 0.05;
                this.flowRateInput.value = 0;
                this.fluidSelect.value = 'water';
                if (this.flowRateValue) this.flowRateValue.textContent = '0.0';
                // Clear readings
                this.readings = [];
                this.updateReadingsTable(true);
                // Enable all inputs
                this.lengthInput.disabled = false;
                this.diameterInput.disabled = false;
                this.flowRateInput.disabled = false;
                this.fluidSelect.disabled = false;
                if (stopBtn) stopBtn.disabled = false;
                resetBtn.disabled = false;
                // Restart simulation
                this.isRunning = true;
                this.needsUpdate = true;
                this.updateSimulation();
            });
        }
    }

    recordReading() {
        const currentTime = new Date().toLocaleTimeString();
        const reading = {
            time: currentTime,
            fluidType: this.fluidSelect.value,
            flowRate: parseFloat(this.flowRateInput.value).toFixed(1),
            velocity: this.simulationValues.velocity.toFixed(3),
            headLoss: this.simulationValues.headLoss.toFixed(3),
            frictionFactor: this.simulationValues.frictionFactor.toFixed(4)
        };
        
        this.readings.push(reading);
        this.updateReadingsTable();
    }

    updateReadingsTable(clear = false) {
        const tbody = document.querySelector('#readings-table tbody');
        if (clear) {
            tbody.innerHTML = '';
            return;
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${this.readings[this.readings.length - 1].time}</td>
            <td>${this.readings[this.readings.length - 1].fluidType}</td>
            <td>${this.readings[this.readings.length - 1].flowRate}</td>
            <td>${this.readings[this.readings.length - 1].velocity}</td>
            <td>${this.readings[this.readings.length - 1].headLoss}</td>
            <td>${this.readings[this.readings.length - 1].frictionFactor}</td>
        `;
        tbody.appendChild(row);
    }

    exportToPDF() {
        if (this.readings.length === 0) {
            alert('No readings to export!');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text('Pipe Flow Simulation Readings', 14, 20);

        // Add timestamp
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Create table
        doc.autoTable({
            head: [['Time', 'Fluid Type', 'Flow Rate (L/s)', 'Velocity (m/s)', 'Head Loss (m)', 'Friction Factor']],
            body: this.readings.map(reading => [
                reading.time,
                reading.fluidType,
                reading.flowRate,
                reading.velocity,
                reading.headLoss,
                reading.frictionFactor
            ]),
            startY: 35,
            headStyles: { fillColor: [52, 152, 219] }
        });

        // Save the PDF
        doc.save('pipe-flow-readings.pdf');
    }
}

// Theme Toggle Functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update visualizations if simulator exists
    if (window.simulator) {
        window.simulator.drawPipe();
        window.simulator.setupChart();
    }
}

// Initialize theme
initTheme();

// Add event listener to theme toggle button
document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

// Add theme change observer to redraw static diagram
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            drawStaticPipeDiagram();
            if (window.simulator) {
                window.simulator.drawPipe();
                window.simulator.setupChart();
            }
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// Voice Assistant Logic
(function() {
    const steps = [
        "Welcome to the Pipe Flow Simulator! I will guide you step by step.",
        "Step 1: Click the 'Start Simulation' button to begin the experiment.",
        "Step 2: Enter the input parameters such as pipe length, diameter, flow rate, and select the fluid type.",
        "Step 3: Set the pipe length and diameter using the input fields on the left.",
        "Step 4: Adjust the flow rate using the slider. You can also select the fluid type.",
        "Step 5: Observe the flow visualization and the pressure meter on the right.",
        "Step 6: Check the calculation and results card for velocity, head loss, and friction factor.",
        "Step 7: Record readings by clicking the 'Record Reading' button. Export your data as PDF if needed.",
        "Step 8: Use the graph to analyze head loss versus flow velocity.",
        "You can stop or reset the simulation at any time using the buttons provided.",
        "This concludes the guided tour. If you need help again, click the microphone button!"
    ];
    let currentStep = 0;
    let isSpeaking = false;
    let synth = window.speechSynthesis;
    let selectedVoice = null;
    let hasStarted = false;
    let autoAdvance = false;

    // Find a male voice
    function pickMaleVoice() {
        const voices = synth.getVoices();
        // Try to find a male English voice
        let male = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
        if (!male) {
            // Fallback: pick any English voice with 'male' in the name or a common male voice
            male = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('man') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('fred') || v.name.toLowerCase().includes('daniel')));
        }
        if (!male) {
            // Fallback: pick any English voice
            male = voices.find(v => v.lang.startsWith('en'));
        }
        return male || voices[0];
    }

    function speakStep(stepIdx) {
        if (!synth) return;
        synth.cancel();
        isSpeaking = true;
        const utter = new SpeechSynthesisUtterance(steps[stepIdx]);
        if (selectedVoice) utter.voice = selectedVoice;
        utter.rate = 1.02;
        utter.pitch = 1.0;
        utter.onend = () => { isSpeaking = false; };
        synth.speak(utter);
    }

    function showDialog() {
        document.getElementById('voice-assistant-dialog').style.display = 'block';
        document.getElementById('voice-assistant-step').textContent = steps[currentStep];
    }
    function hideDialog() {
        document.getElementById('voice-assistant-dialog').style.display = 'none';
    }
    function updateStep(idx, manual = false) {
        currentStep = idx;
        window.assistantCurrentStep = currentStep; // Keep global reference in sync
        document.getElementById('voice-assistant-step').textContent = steps[currentStep];
        if (manual) {
            autoAdvance = false;
            window.assistantAutoAdvance = autoAdvance;
        }
        speakStep(currentStep);
    }

    // Button event listeners
    document.getElementById('voice-assistant-btn').addEventListener('click', function() {
        showDialog();
        updateStep(0);
    });
    document.getElementById('va-next').addEventListener('click', function() {
        if (currentStep < steps.length - 1) {
            updateStep(currentStep + 1);
        }
    });
    document.getElementById('va-prev').addEventListener('click', function() {
        if (currentStep > 0) {
            updateStep(currentStep - 1);
        }
    });
    document.getElementById('va-repeat').addEventListener('click', function() {
        speakStep(currentStep);
    });
    document.getElementById('va-stop').addEventListener('click', function() {
        synth.cancel();
        hideDialog();
    });

    // On load, pick a male voice (after voices are loaded)
    function setVoice() {
        selectedVoice = pickMaleVoice();
    }
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = setVoice;
    }
    setVoice();

    // Auto-start assistant on page load (only once)
    window.addEventListener('DOMContentLoaded', function() {
        if (!hasStarted) {
            autoAdvance = true;
            showDialog();
            updateStep(0);
            hasStarted = true;
        }
    });

    // Expose variables globally for button interaction
    window.assistantSteps = steps;
    window.assistantCurrentStep = currentStep;
    window.assistantAutoAdvance = autoAdvance;
    window.assistantUpdateStep = updateStep;
})();

// Button click listeners for auto-advancing assistant
(function() {
    // Helper to check if assistant is open and can advance
    function assistantCanAdvance() {
        const dialog = document.getElementById('voice-assistant-dialog');
        return dialog && dialog.style.display !== 'none' && 
               typeof window.assistantCurrentStep !== 'undefined' && 
               typeof window.assistantUpdateStep === 'function' &&
               window.assistantCurrentStep < window.assistantSteps.length - 1;
    }

    // Wait for DOM to be ready before adding listeners
    document.addEventListener('DOMContentLoaded', function() {
        // Listen for Start Simulation button
        const startBtn = document.getElementById('start-simulation');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                setTimeout(() => {
                    if (assistantCanAdvance()) {
                        window.assistantAutoAdvance = true;
                        window.assistantUpdateStep(window.assistantCurrentStep + 1);
                    }
                }, 1000);
            });
        }

        // Listen for Record Reading button
        const recordBtn = document.getElementById('record-reading');
        if (recordBtn) {
            recordBtn.addEventListener('click', function() {
                setTimeout(() => {
                    if (assistantCanAdvance()) {
                        window.assistantAutoAdvance = true;
                        window.assistantUpdateStep(window.assistantCurrentStep + 1);
                    }
                }, 500);
            });
        }

        // Listen for Export PDF button
        const exportBtn = document.getElementById('export-pdf');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                setTimeout(() => {
                    if (assistantCanAdvance()) {
                        window.assistantAutoAdvance = true;
                        window.assistantUpdateStep(window.assistantCurrentStep + 1);
                    }
                }, 500);
            });
        }

        // Listen for input changes (flow rate, diameter, etc.)
        const flowRateInput = document.getElementById('flowRate');
        if (flowRateInput) {
            flowRateInput.addEventListener('change', function() {
                setTimeout(() => {
                    if (assistantCanAdvance() && window.assistantCurrentStep === 3) {
                        window.assistantAutoAdvance = true;
                        window.assistantUpdateStep(window.assistantCurrentStep + 1);
                    }
                }, 1000);
            });
        }
    });
})(); 
