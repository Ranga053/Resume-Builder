// Resume Builder Application
class ResumeBuilder {
    constructor() {
        this.currentTemplate = 'classic';
        this.resumeData = this.getInitialData();
        this.autoSaveTimer = null;
        this.skillsArray = [];
        
        this.init();
    }

    getInitialData() {
        return {
            personal: {
                name: '',
                email: '',
                phone: '',
                address: '',
                linkedin: '',
                website: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: []
        };
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
        this.updatePreview();
        this.startAutoSave();
    }

    bindEvents() {
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectTemplate(e.target.closest('.template-card').dataset.template));
        });

        // Form inputs
        document.getElementById('resumeForm').addEventListener('input', (e) => {
            this.handleFormInput(e);
            this.updatePreview();
        });

        // Dynamic section buttons
        document.getElementById('addExperienceBtn').addEventListener('click', () => this.addExperience());
        document.getElementById('addEducationBtn').addEventListener('click', () => this.addEducation());
        document.getElementById('addProjectBtn').addEventListener('click', () => this.addProject());
        document.getElementById('addCertificationBtn').addEventListener('click', () => this.addCertification());

        // Skills input
        document.getElementById('skillInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill();
            }
        });

        // Header actions
        document.getElementById('loadSampleBtn').addEventListener('click', () => this.loadSampleData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());

        // Export buttons
        document.getElementById('printBtn').addEventListener('click', () => this.printResume());
        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('downloadWordBtn').addEventListener('click', () => this.downloadWord());
    }

    selectTemplate(templateName) {
        this.currentTemplate = templateName;
        
        // Update active template card
        document.querySelectorAll('.template-card').forEach(card => card.classList.remove('active'));
        document.querySelector(`[data-template="${templateName}"]`).classList.add('active');
        
        // Update preview template class
        const preview = document.getElementById('resumePreview');
        preview.className = `resume-preview ${templateName}-template`;
        
        this.updatePreview();
        this.showNotification('Template changed successfully!', 'success');
    }

    handleFormInput(e) {
        const { name, value } = e.target;
        
        if (name in this.resumeData.personal) {
            this.resumeData.personal[name] = value;
        } else if (name === 'summary') {
            this.resumeData.summary = value;
        } else if (name.includes('-')) {
            // Handle dynamic section inputs
            this.handleDynamicInput(name, value);
        }
    }

    handleDynamicInput(name, value) {
        const [section, index, field] = name.split('-');
        const idx = parseInt(index);
        
        if (this.resumeData[section] && this.resumeData[section][idx]) {
            this.resumeData[section][idx][field] = value;
        }
    }

    addExperience() {
        const newExperience = {
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        this.resumeData.experience.push(newExperience);
        this.renderExperienceSection();
        this.updatePreview();
        
        // Focus on the first input of the new experience
        setTimeout(() => {
            const container = document.getElementById('experienceContainer');
            const lastEntry = container.lastElementChild;
            const firstInput = lastEntry?.querySelector('input');
            firstInput?.focus();
        }, 100);
    }

    addEducation() {
        const newEducation = {
            degree: '',
            school: '',
            location: '',
            startDate: '',
            endDate: ''
        };
        
        this.resumeData.education.push(newEducation);
        this.renderEducationSection();
        this.updatePreview();
        
        setTimeout(() => {
            const container = document.getElementById('educationContainer');
            const lastEntry = container.lastElementChild;
            const firstInput = lastEntry?.querySelector('input');
            firstInput?.focus();
        }, 100);
    }

    addProject() {
        const newProject = {
            name: '',
            description: '',
            technologies: ''
        };
        
        this.resumeData.projects.push(newProject);
        this.renderProjectsSection();
        this.updatePreview();
        
        setTimeout(() => {
            const container = document.getElementById('projectsContainer');
            const lastEntry = container.lastElementChild;
            const firstInput = lastEntry?.querySelector('input');
            firstInput?.focus();
        }, 100);
    }

    addCertification() {
        const newCertification = {
            name: '',
            issuer: '',
            date: ''
        };
        
        this.resumeData.certifications.push(newCertification);
        this.renderCertificationsSection();
        this.updatePreview();
        
        setTimeout(() => {
            const container = document.getElementById('certificationsContainer');
            const lastEntry = container.lastElementChild;
            const firstInput = lastEntry?.querySelector('input');
            firstInput?.focus();
        }, 100);
    }

    removeEntry(section, index) {
        this.resumeData[section].splice(index, 1);
        this.renderDynamicSection(section);
        this.updatePreview();
        this.showNotification('Entry removed', 'success');
    }

    addSkill() {
        const skillInput = document.getElementById('skillInput');
        const skillText = skillInput.value.trim();
        
        if (skillText && !this.resumeData.skills.includes(skillText)) {
            this.resumeData.skills.push(skillText);
            this.renderSkills();
            this.updatePreview();
            skillInput.value = '';
            skillInput.focus();
        }
    }

    removeSkill(skill) {
        const index = this.resumeData.skills.indexOf(skill);
        if (index > -1) {
            this.resumeData.skills.splice(index, 1);
            this.renderSkills();
            this.updatePreview();
        }
    }

    renderDynamicSection(section) {
        switch(section) {
            case 'experience':
                this.renderExperienceSection();
                break;
            case 'education':
                this.renderEducationSection();
                break;
            case 'projects':
                this.renderProjectsSection();
                break;
            case 'certifications':
                this.renderCertificationsSection();
                break;
        }
    }

    renderExperienceSection() {
        const container = document.getElementById('experienceContainer');
        container.innerHTML = '';
        
        this.resumeData.experience.forEach((exp, index) => {
            const entryHtml = `
                <div class="entry-container">
                    <div class="entry-header">
                        <h4 class="entry-title">Experience ${index + 1}</h4>
                        <button type="button" class="remove-btn" onclick="resumeBuilder.removeEntry('experience', ${index})">Remove</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Job Title *</label>
                        <input type="text" class="form-control" name="experience-${index}-title" value="${exp.title}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Company *</label>
                            <input type="text" class="form-control" name="experience-${index}-company" value="${exp.company}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" class="form-control" name="experience-${index}-location" value="${exp.location}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Start Date</label>
                            <input type="month" class="form-control" name="experience-${index}-startDate" value="${exp.startDate}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">End Date</label>
                            <input type="month" class="form-control" name="experience-${index}-endDate" value="${exp.endDate}" placeholder="Present">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" name="experience-${index}-description" rows="3">${exp.description}</textarea>
                    </div>
                </div>
            `;
            container.innerHTML += entryHtml;
        });
    }

    renderEducationSection() {
        const container = document.getElementById('educationContainer');
        container.innerHTML = '';
        
        this.resumeData.education.forEach((edu, index) => {
            const entryHtml = `
                <div class="entry-container">
                    <div class="entry-header">
                        <h4 class="entry-title">Education ${index + 1}</h4>
                        <button type="button" class="remove-btn" onclick="resumeBuilder.removeEntry('education', ${index})">Remove</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Degree *</label>
                        <input type="text" class="form-control" name="education-${index}-degree" value="${edu.degree}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">School *</label>
                            <input type="text" class="form-control" name="education-${index}-school" value="${edu.school}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" class="form-control" name="education-${index}-location" value="${edu.location}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Start Date</label>
                            <input type="month" class="form-control" name="education-${index}-startDate" value="${edu.startDate}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">End Date</label>
                            <input type="month" class="form-control" name="education-${index}-endDate" value="${edu.endDate}">
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += entryHtml;
        });
    }

    renderProjectsSection() {
        const container = document.getElementById('projectsContainer');
        container.innerHTML = '';
        
        this.resumeData.projects.forEach((project, index) => {
            const entryHtml = `
                <div class="entry-container">
                    <div class="entry-header">
                        <h4 class="entry-title">Project ${index + 1}</h4>
                        <button type="button" class="remove-btn" onclick="resumeBuilder.removeEntry('projects', ${index})">Remove</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Project Name *</label>
                        <input type="text" class="form-control" name="projects-${index}-name" value="${project.name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" name="projects-${index}-description" rows="2">${project.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Technologies Used</label>
                        <input type="text" class="form-control" name="projects-${index}-technologies" value="${project.technologies}">
                    </div>
                </div>
            `;
            container.innerHTML += entryHtml;
        });
    }

    renderCertificationsSection() {
        const container = document.getElementById('certificationsContainer');
        container.innerHTML = '';
        
        this.resumeData.certifications.forEach((cert, index) => {
            const entryHtml = `
                <div class="entry-container">
                    <div class="entry-header">
                        <h4 class="entry-title">Certification ${index + 1}</h4>
                        <button type="button" class="remove-btn" onclick="resumeBuilder.removeEntry('certifications', ${index})">Remove</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Certification Name *</label>
                        <input type="text" class="form-control" name="certifications-${index}-name" value="${cert.name}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Issuer</label>
                            <input type="text" class="form-control" name="certifications-${index}-issuer" value="${cert.issuer}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input type="month" class="form-control" name="certifications-${index}-date" value="${cert.date}">
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += entryHtml;
        });
    }

    renderSkills() {
        const container = document.getElementById('skillsContainer');
        container.innerHTML = '';
        
        this.resumeData.skills.forEach(skill => {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                ${skill}
                <button type="button" class="skill-remove" onclick="resumeBuilder.removeSkill('${skill}')">&times;</button>
            `;
            container.appendChild(skillTag);
        });
    }

    updatePreview() {
        const preview = document.getElementById('resumePreview');
        const { personal, summary, experience, education, skills, projects, certifications } = this.resumeData;
        
        let html = `
            <div class="resume-header">
                <h1 class="resume-name">${personal.name || 'Your Name'}</h1>
                <div class="resume-contact">
                    ${personal.email ? `<span>${personal.email}</span>` : ''}
                    ${personal.phone ? `<span>${personal.phone}</span>` : ''}
                    ${personal.address ? `<span>${personal.address}</span>` : ''}
                    ${personal.linkedin ? `<span>${personal.linkedin}</span>` : ''}
                    ${personal.website ? `<span>${personal.website}</span>` : ''}
                </div>
            </div>
        `;

        if (summary) {
            html += `
                <div class="resume-section">
                    <h2 class="section-title">Professional Summary</h2>
                    <p>${summary}</p>
                </div>
            `;
        }

        if (experience.length > 0) {
            html += `
                <div class="resume-section">
                    <h2 class="section-title">Work Experience</h2>
                    ${experience.map(exp => `
                        <div class="entry">
                            <div class="entry-title">${exp.title} ${exp.company ? `at ${exp.company}` : ''}</div>
                            <div class="entry-subtitle">
                                ${exp.location ? `${exp.location} | ` : ''}
                                ${this.formatDateRange(exp.startDate, exp.endDate)}
                            </div>
                            ${exp.description ? `<p>${exp.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (education.length > 0) {
            html += `
                <div class="resume-section">
                    <h2 class="section-title">Education</h2>
                    ${education.map(edu => `
                        <div class="entry">
                            <div class="entry-title">${edu.degree}</div>
                            <div class="entry-subtitle">
                                ${edu.school}${edu.location ? `, ${edu.location}` : ''}
                                ${this.formatDateRange(edu.startDate, edu.endDate) ? ` | ${this.formatDateRange(edu.startDate, edu.endDate)}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (skills.length > 0) {
            html += `
                <div class="resume-section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-display">
                        ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (projects.length > 0) {
            html += `
                <div class="resume-section">
                    <h2 class="section-title">Projects</h2>
                    ${projects.map(project => `
                        <div class="entry">
                            <div class="entry-title">${project.name}</div>
                            ${project.technologies ? `<div class="entry-subtitle">${project.technologies}</div>` : ''}
                            ${project.description ? `<p>${project.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (certifications.length > 0) {
            html += `
                <div class="resume-section">
                       <h2 class="section-title">Certifications</h2>
                    ${certifications.map(cert => `
                        <div class="entry">
                            <div class="entry-title">${cert.name}</div>
                            <div class="entry-subtitle">
                                ${cert.issuer ? `${cert.issuer}` : ''}
                                ${cert.date ? ` | ${this.formatDate(cert.date)}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        preview.innerHTML = html;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    formatDateRange(startDate, endDate) {
        if (!startDate) return '';
        const start = this.formatDate(startDate);
        const end = endDate && endDate !== 'Present' ? this.formatDate(endDate) : (endDate === 'Present' ? 'Present' : 'Present');
        return `${start} - ${end}`;
    }

    loadSampleData() {
        const sampleData = {
            personal: {
                name: "John Smith",
                email: "john.smith@email.com",
                phone: "(555) 123-4567",
                address: "New York, NY",
                linkedin: "linkedin.com/in/johnsmith",
                website: "johnsmith.dev"
            },
            summary: "Experienced web developer with 5+ years creating modern, responsive applications. Passionate about clean code and user experience.",
            experience: [
                {
                    title: "Senior Web Developer",
                    company: "Tech Corp",
                    location: "New York, NY",
                    startDate: "2020-01",
                    endDate: "Present",
                    description: "Led development of 10+ web applications using modern frameworks. Improved site performance by 40% and mentored junior developers."
                }
            ],
            education: [
                {
                    degree: "Bachelor of Science in Computer Science",
                    school: "University of Technology",
                    location: "New York, NY",
                    startDate: "2016-09",
                    endDate: "2020-05"
                }
            ],
            skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
            projects: [
                {
                    name: "E-commerce Platform",
                    description: "Built full-stack e-commerce solution with payment integration",
                    technologies: "React, Node.js, MongoDB"
                }
            ],
            certifications: [
                {
                    name: "AWS Certified Developer",
                    issuer: "Amazon Web Services",
                    date: "2023-06"
                }
            ]
        };

        this.resumeData = { ...sampleData };
        this.populateForm();
        this.renderAllSections();
        this.updatePreview();
        this.showNotification('Sample data loaded successfully!', 'success');
    }

    populateForm() {
        // Populate personal information
        Object.keys(this.resumeData.personal).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = this.resumeData.personal[key];
            }
        });

        // Populate summary
        document.getElementById('summary').value = this.resumeData.summary;
    }

    renderAllSections() {
        this.renderExperienceSection();
        this.renderEducationSection();
        this.renderProjectsSection();
        this.renderCertificationsSection();
        this.renderSkills();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.resumeData = this.getInitialData();
            document.getElementById('resumeForm').reset();
            this.renderAllSections();
            this.updatePreview();
            this.showNotification('All data cleared successfully!', 'success');
        }
    }

    startAutoSave() {
        // Note: Since localStorage is not available in the sandbox environment,
        // we'll simulate auto-save functionality without actual persistence
        this.autoSaveTimer = setInterval(() => {
            // Only show auto-save notification occasionally to avoid spam
            if (Math.random() > 0.8) {
                this.showNotification('Data auto-saved', 'success');
            }
        }, 5000);
    }

    printResume() {
        window.print();
    }

    async downloadPDF() {
        this.showLoading(true);
        
        try {
            const element = document.getElementById('resumePreview');
            const opt = {
                margin: 10,
                filename: `${this.resumeData.personal.name || 'Resume'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
            this.showNotification('PDF downloaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error downloading PDF. Please try again.', 'error');
            console.error('PDF download error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    downloadWord() {
        this.showLoading(true);
        
        try {
            // Create a simple HTML document structure for Word
            const element = document.getElementById('resumePreview');
            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>Resume</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { font-size: 24px; margin-bottom: 10px; }
                        h2 { font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #000; }
                        .entry { margin-bottom: 15px; }
                        .entry-title { font-weight: bold; }
                        .entry-subtitle { color: #666; font-size: 14px; margin: 2px 0 8px 0; }
                        .skills-display { margin-top: 10px; }
                        .skill-item { display: inline-block; background: #f0f0f0; padding: 4px 8px; margin: 2px; border-radius: 3px; }
                        .resume-contact { margin: 10px 0; }
                        .resume-contact span { margin-right: 15px; }
                    </style>
                </head>
                <body>
                    ${element.innerHTML}
                </body>
                </html>
            `;
            
            const blob = new Blob(['\ufeff', htmlContent], {
                type: 'application/msword'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.resumeData.personal.name || 'Resume'}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showNotification('Word document downloaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error downloading Word document. Please try again.', 'error');
            console.error('Word download error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.remove('show');
            overlay.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Auto-remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Form validation
    validateForm() {
        const requiredFields = ['name', 'email', 'phone'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--color-error)';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });
        
        return isValid;
    }
}

// Initialize the application
const resumeBuilder = new ResumeBuilder();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        resumeBuilder.printResume();
    }
    
    // Ctrl/Cmd + S for save (simulate)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        resumeBuilder.showNotification('Resume data saved!', 'success');
    }
});

// Handle form submission
document.getElementById('resumeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (resumeBuilder.validateForm()) {
        resumeBuilder.showNotification('Resume updated successfully!', 'success');
    } else {
        resumeBuilder.showNotification('Please fill in all required fields.', 'error');
    }
});
