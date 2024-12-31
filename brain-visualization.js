class NeuralNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.connections = [];
        this.pulseRadius = 0;
        this.pulseAlpha = 0;
        this.size = Math.random() * 2 + 1;
        this.nextPulseTime = Math.random() * 3000;
        this.lastPulseTime = performance.now();
    }

    addConnection(node) {
        if (!this.connections.includes(node)) {
            this.connections.push(node);
        }
    }

    update(currentTime) {
        if (currentTime - this.lastPulseTime > this.nextPulseTime) {
            this.pulseRadius = 0;
            this.pulseAlpha = 0.5;
            this.lastPulseTime = currentTime;
            this.nextPulseTime = Math.random() * 3000 + 1000;
        }

        if (this.pulseAlpha > 0) {
            this.pulseRadius += 0.5;
            this.pulseAlpha -= 0.01;
        }
    }
}

class BrainVisualization {
    constructor() {
        this.canvas = document.getElementById('brain-vis');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.primaryColor = '#00fff2';
        this.secondaryColor = '#ff2aff';
        this.resize();
        this.init();
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        // Create nodes in a brain-like shape
        const nodeCount = 100;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const variance = Math.random() * radius * 0.3;
            const distance = radius + variance;
            
            // Create a more brain-like shape using parametric equations
            const x = this.centerX + Math.cos(angle) * distance * (1 + Math.sin(angle * 2) * 0.3);
            const y = this.centerY + Math.sin(angle) * distance * (1 + Math.cos(angle * 3) * 0.2);
            
            this.nodes.push(new NeuralNode(x, y));
        }

        // Add some random nodes inside the brain shape
        for (let i = 0; i < nodeCount * 0.5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance;
            this.nodes.push(new NeuralNode(x, y));
        }

        // Create connections between nearby nodes
        this.nodes.forEach(node => {
            const nearbyNodes = this.nodes
                .filter(other => other !== node)
                .filter(other => {
                    const distance = Math.hypot(other.x - node.x, other.y - node.y);
                    return distance < radius * 0.3;
                })
                .slice(0, 3);

            nearbyNodes.forEach(other => node.addConnection(other));
        });
    }

    drawConnection(node1, node2, alpha = 0.2) {
        const gradient = this.ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y);
        gradient.addColorStop(0, `${this.primaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${this.secondaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);

        this.ctx.beginPath();
        this.ctx.moveTo(node1.x, node1.y);
        this.ctx.lineTo(node2.x, node2.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
    }

    drawNode(node) {
        // Draw connections
        node.connections.forEach(other => {
            this.drawConnection(node, other);
        });

        // Draw node
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.primaryColor;
        this.ctx.fill();

        // Draw pulse
        if (node.pulseAlpha > 0) {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.pulseRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `${this.primaryColor}${Math.floor(node.pulseAlpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Draw enhanced connections during pulse
            node.connections.forEach(other => {
                this.drawConnection(node, other, node.pulseAlpha);
            });
        }
    }

    animate() {
        const currentTime = performance.now();
        
        // Clear canvas with slight fade effect
        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw nodes
        this.nodes.forEach(node => {
            node.update(currentTime);
            this.drawNode(node);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize visualization when the page loads
window.addEventListener('load', () => {
    new BrainVisualization();
});
