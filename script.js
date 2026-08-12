document.addEventListener('DOMContentLoaded', () => {
    const subjectInput = document.getElementById('subjectInput');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectsContainer = document.getElementById('subjectsContainer');

    let subjects = JSON.parse(localStorage.getItem('attendanceData')) || [];

    const saveToLocalStorage = () => {
        localStorage.setItem('attendanceData', JSON.stringify(subjects));
    };

    const calculateGoal = (present, total) => {
        const threshold = 0.75;
        if (total === 0) return { status: 'neutral', message: 'Add attendance to see status' };
        
        const currentPercentage = present / total;
        
        if (currentPercentage >= threshold) {
            // How many classes can be missed?
            // (present) / (total + x) = 0.75
            // present = 0.75 * total + 0.75 * x
            // x = (present - 0.75 * total) / 0.75
            const canMiss = Math.floor((present - 0.75 * total) / 0.75);
            return {
                status: 'good',
                message: `You're safe! You can miss next ${canMiss} classes.`
            };
        } else {
            // How many classes must be attended?
            // (present + x) / (total + x) = 0.75
            // present + x = 0.75 * total + 0.75 * x
            // 0.25 * x = 0.75 * total - present
            // x = (0.75 * total - present) / 0.25
            const mustAttend = Math.ceil((0.75 * total - present) / 0.25);
            return {
                status: 'bad',
                message: `Warning! You need to attend next ${mustAttend} classes.`
            };
        }
    };

    const renderSubjects = () => {
        subjectsContainer.innerHTML = '';
        subjects.forEach((subject, index) => {
            const percentage = subject.total === 0 ? 0 : Math.round((subject.present / subject.total) * 100);
            const goal = calculateGoal(subject.present, subject.total);

            const card = document.createElement('div');
            card.className = 'glass-card subject-card';
            card.innerHTML = `
                <div class="subject-header">
                    <span class="subject-name">${subject.name}</span>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
                <div class="percentage-display">
                    <div class="percentage-value">${percentage}%</div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="stats">
                    <span>Present: ${subject.present}</span>
                    <span>Total: ${subject.total}</span>
                </div>
                <div class="goal-status ${goal.status === 'good' ? 'status-good' : (goal.status === 'bad' ? 'status-bad' : '')}">
                    ${goal.message}
                </div>
                <div class="controls">
                    <button class="btn-present" data-index="${index}">Present</button>
                    <button class="btn-absent" data-index="${index}">Absent</button>
                </div>
            `;
            subjectsContainer.appendChild(card);
        });

        // Add event listeners for buttons within cards
        document.querySelectorAll('.btn-present').forEach(btn => {
            btn.onclick = () => updateAttendance(btn.dataset.index, true);
        });
        document.querySelectorAll('.btn-absent').forEach(btn => {
            btn.onclick = () => updateAttendance(btn.dataset.index, false);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => deleteSubject(btn.dataset.index);
        });
    };

    const updateAttendance = (index, isPresent) => {
        subjects[index].total++;
        if (isPresent) subjects[index].present++;
        saveToLocalStorage();
        renderSubjects();
    };

    const deleteSubject = (index) => {
        if(confirm('Are you sure you want to delete this subject?')) {
            subjects.splice(index, 1);
            saveToLocalStorage();
            renderSubjects();
        }
    };

    addSubjectBtn.addEventListener('click', () => {
        const name = subjectInput.value.trim();
        if (name) {
            subjects.push({
                name,
                present: 0,
                total: 0
            });
            subjectInput.value = '';
            saveToLocalStorage();
            renderSubjects();
        }
    });

    subjectInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSubjectBtn.click();
    });

    renderSubjects();
});
