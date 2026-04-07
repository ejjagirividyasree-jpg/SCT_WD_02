// STOPWATCH WEB APPLICATION
// Features: Start, Pause, Reset, Lap Tracking, Time Interval Measurement

class Stopwatch {
    constructor() {
        // Timer variables
        this.startTime = 0;
        this.elapsedTime = 0;
        this.running = false;
        this.timerInterval = null;
        
        // DOM elements
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.millisecondsElement = document.getElementById('milliseconds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.clearLapsBtn = document.getElementById('clearLapsBtn');
        this.lapList = document.getElementById('lapList');
        this.lapCountElement = document.getElementById('lapCount');
        this.statusText = document.getElementById('statusText');
        this.bestLapElement = document.getElementById('bestLap');
        
        // Lap tracking variables
        this.laps = [];
        this.lastLapTime = 0;
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initial display update
        this.updateDisplay();
        
        // Set initial button states
        this.pauseBtn.disabled = true;
    }
    
    initEventListeners() {
        // START function
        this.startBtn.addEventListener('click', () => this.start());
        
        // PAUSE function
        this.pauseBtn.addEventListener('click', () => this.pause());
        
        // RESET function
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // LAP function - for tracking time intervals
        this.lapBtn.addEventListener('click', () => this.recordLap());
        
        // Clear all laps
        this.clearLapsBtn.addEventListener('click', () => this.clearAllLaps());
    }
    
    // START FUNCTION - Begins timing
    start() {
        if (!this.running) {
            this.startTime = Date.now() - this.elapsedTime;
            this.running = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 10); // 10ms for millisecond precision
            this.updateStatus('Running');
            document.querySelector('.container').classList.add('running');
            
            // Update button states
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.resetBtn.disabled = false;
            this.lapBtn.disabled = false;
        }
    }
    
    // PAUSE FUNCTION - Stops timing without resetting
    pause() {
        if (this.running) {
            this.running = false;
            clearInterval(this.timerInterval);
            this.updateStatus('Paused');
            document.querySelector('.container').classList.remove('running');
            
            // Update button states
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.lapBtn.disabled = true;
        }
    }
    
    // RESET FUNCTION - Resets timer to zero and clears all laps
    reset() {
        // Stop the timer if running
        if (this.running) {
            this.pause();
        }
        
        // Reset all time variables
        this.elapsedTime = 0;
        this.startTime = 0;
        this.lastLapTime = 0;
        
        // Clear all laps
        this.clearAllLaps();
        
        // Update display
        this.updateDisplay();
        this.updateStatus('Stopped');
        
        // Update button states
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.lapBtn.disabled = true;
        
        // Remove running class
        document.querySelector('.container').classList.remove('running');
    }
    
    // Update timer (called every 10ms)
    updateTimer() {
        const currentTime = Date.now();
        this.elapsedTime = currentTime - this.startTime;
        this.updateDisplay();
    }
    
    // Update the display with current time
    updateDisplay() {
        const totalMilliseconds = this.elapsedTime;
        
        const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((totalMilliseconds % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);
        
        this.hoursElement.textContent = this.padNumber(hours);
        this.minutesElement.textContent = this.padNumber(minutes);
        this.secondsElement.textContent = this.padNumber(seconds);
        this.millisecondsElement.textContent = this.padNumber(milliseconds);
    }
    
    // RECORD LAP FUNCTION - Captures current time interval
    recordLap() {
        if (this.running) {
            const currentLapTime = this.elapsedTime;
            const lapNumber = this.laps.length + 1;
            
            // Calculate time interval since last lap (or since start)
            let lapDifference = 0;
            let intervalTime = 0;
            
            if (this.lastLapTime === 0) {
                // First lap: interval is total elapsed time
                intervalTime = currentLapTime;
                lapDifference = currentLapTime;
            } else {
                // Subsequent laps: interval is time since last lap
                intervalTime = currentLapTime - this.lastLapTime;
                lapDifference = intervalTime;
            }
            
            const lapData = {
                number: lapNumber,
                totalTime: currentLapTime,
                intervalTime: intervalTime,  // Time interval between laps
                timestamp: new Date()
            };
            
            this.laps.push(lapData);
            this.lastLapTime = currentLapTime;
            
            // Render laps and update statistics
            this.renderLaps();
            this.updateLapCount();
            this.updateBestLap();
            
            // Auto-scroll to the new lap
            setTimeout(() => {
                const lapItems = document.querySelectorAll('.lap-item');
                if (lapItems.length > 0) {
                    lapItems[lapItems.length - 1].scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
            }, 100);
            
            // Optional: Add visual feedback
            this.lapBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.lapBtn.style.transform = '';
            }, 200);
        }
    }
    
    // Clear all recorded laps
    clearAllLaps() {
        this.laps = [];
        this.lastLapTime = 0;
        this.renderLaps();
        this.updateLapCount();
        this.updateBestLap();
    }
    
    // Render all laps in the UI
    renderLaps() {
        if (this.laps.length === 0) {
            this.lapList.innerHTML = `
                <div class="empty-laps">
                    <i class="fas fa-hourglass-half"></i>
                    <p>No laps recorded yet</p>
                    <span>Click "Lap" to record time intervals</span>
                </div>
            `;
            return;
        }
        
        // Find best lap (smallest interval time)
        let bestLapNumber = -1;
        let bestLapTime = Infinity;
        this.laps.forEach(lap => {
            if (lap.intervalTime < bestLapTime && lap.intervalTime > 0) {
                bestLapTime = lap.intervalTime;
                bestLapNumber = lap.number;
            }
        });
        
        this.lapList.innerHTML = this.laps.map(lap => {
            const formattedTotal = this.formatTime(lap.totalTime);
            const formattedInterval = this.formatTime(lap.intervalTime);
            const isBestLap = (lap.number === bestLapNumber && bestLapNumber !== -1);
            const bestClass = isBestLap ? 'best-lap' : '';
            
            return `
                <div class="lap-item ${bestClass}">
                    <div class="lap-number">
                        Lap ${lap.number}
                        ${isBestLap ? ' 🏆' : ''}
                    </div>
                    <div class="lap-time">${formattedTotal}</div>
                    <div class="lap-diff positive">
                        +${formattedInterval}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Update lap count display
    updateLapCount() {
        this.lapCountElement.textContent = this.laps.length;
    }
    
    // Update best lap display
    updateBestLap() {
        if (this.laps.length === 0) {
            this.bestLapElement.textContent = '--';
            return;
        }
        
        let bestInterval = Infinity;
        this.laps.forEach(lap => {
            if (lap.intervalTime < bestInterval && lap.intervalTime > 0) {
                bestInterval = lap.intervalTime;
            }
        });
        
        if (bestInterval !== Infinity) {
            this.bestLapElement.textContent = this.formatTime(bestInterval);
        } else {
            this.bestLapElement.textContent = '--';
        }
    }
    
    // Update status text
    updateStatus(status) {
        this.statusText.textContent = status;
    }
    
    // Format milliseconds to readable time
    formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        if (hours > 0) {
            return `${this.padNumber(hours)}:${this.padNumber(minutes)}:${this.padNumber(seconds)}.${this.padNumber(ms)}`;
        } else if (minutes > 0) {
            return `${this.padNumber(minutes)}:${this.padNumber(seconds)}.${this.padNumber(ms)}`;
        } else {
            return `${seconds}.${this.padNumber(ms)}s`;
        }
    }
    
    // Pad number with leading zeros
    padNumber(num) {
        return num.toString().padStart(2, '0');
    }
}

// Initialize the stopwatch when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});