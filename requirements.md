# Requirements Document: StudyPlanAI

> Generated: 2026-03-22
> Version: 1.0

---

## 1. Domain Overview

**Problem Statement**
Students struggle to create effective, personalized study plans without expert guidance. Existing tools lack AI-powered customization, fail to maintain engagement through gamification, and don't provide ongoing supervision to keep students accountable. Most students abandon study plans within weeks due to lack of motivation and structure.

**Solution Vision**
StudyPlanAI is an AI-powered study companion that generates personalized curriculum based on each student's goals, learning style, and available time. The AI acts as a virtual tutor that supervises progress, adapts plans dynamically, and provides encouragement. A gamification layer with XP, streaks, badges, and levels transforms studying into an engaging, rewarding experience—similar to how Duolingo makes language learning addictive.

**Target Market/Context**
- Students (high school, university, self-learners) who want structured learning paths
- Professional upskilling and certification preparation
- Hobbyists pursuing new knowledge areas
Currently, students either use generic templates, hire tutors (expensive), or rely on willpower alone (low success rate).

---

## 2. Stakeholders & User Roles

| Role | Description | Technical Level | Primary Needs |
|------|-------------|-----------------|---------------|
| **Student** | Primary user who creates study plans, completes modules, earns rewards | Medium | Personalized plans, motivation, progress tracking, intuitive UI |
| **AI Tutor** | System角色的AI assistant that generates plans, monitors progress, provides feedback | N/A | Reliable API, context awareness, adaptive responses |
| **Administrator** | Platform manager who configures AI, manages users, views analytics | High | User management, system configuration, reporting tools |

---

## 3. Épicas

### ÉPICA-01: Plan de Estudios Inteligente con IA
**Description**: AI-powered system that generates personalized study plans based on student goals, available time, and learning preferences. Students can customize and iterate on AI-generated plans.

**Business Value**: Differentiates StudyPlanAI from static template tools. AI customization increases plan relevance by 60%+ compared to one-size-fits-all approaches.

**Definition of Done**:
- [ ] AI generates complete curriculum with modules and milestones
- [ ] Student can edit/modify generated plans
- [ ] AI responds to plan modification requests within 10 seconds
- [ ] Plan history is saved and versioned

---

### ÉPICA-02: Sistema de Gamificación y Motivación
**Description**: Gamified layer that rewards students for completing study activities. Includes XP system, daily streaks, achievements/badges, and level progression.

**Business Value**: Gamification increases user retention by 40%+. Streaks and rewards create daily engagement habits essential for learning success.

**Definition of Done**:
- [ ] XP awarded for each completed milestone
- [ ] Streak counter tracks consecutive study days
- [ ] At least 5 badge types available
- [ ] Level progression visible on profile
- [ ] Progress animations are smooth (60fps)

---

### ÉPICA-03: Tutor IA Supervisor
**Description**: AI Tutor角色 that actively supervises student progress, provides feedback, adjusts plans based on performance, and offers study tips via chat interface.

**Business Value**: Continuous AI supervision replaces expensive human tutors. AI can identify struggling students 3x faster than weekly check-ins.

**Definition of Done**:
- [ ] AI chat interface available during study sessions
- [ ] AI generates weekly progress summaries
- [ ] AI recommends plan adjustments when milestones are missed
- [ ] Sentiment analysis detects student frustration/demotivation

---

### ÉPICA-04: Módulos y Hitos de Estudio
**Description**: Curriculum organized into thematic modules containing milestones. Each module has clear completion criteria, resources, and progress tracking.

**Business Value**: Modular structure makes large goals achievable. Studies show chunking improves retention by 30%.

**Definition of Done**:
- [ ] Modules display as visual cards with progress indicators
- [ ] Milestones within modules are clearly marked
- [ ] Module completion triggers reward animation
- [ ] Resources (links, files) can be attached to milestones

---

### ÉPICA-05: Panel de Estudiante (Dashboard)
**Description**: Central dashboard showing current plan progress, streak calendar, achievements, and quick actions. Designed to be the student's mission control.

**Business Value**: Single source of truth increases daily app opens by 25%. Visual progress creates emotional investment in completing plans.

**Definition of Done**:
- [ ] Dashboard loads in under 2 seconds
- [ ] Current plan progress prominently displayed
- [ ] Streak calendar shows last 30 days
- [ ] Quick actions (continue studying, view stats) easily accessible

---

### ÉPICA-06: Gestión Administrativa
**Description**: Admin panel for user management, AI configuration, and platform analytics. Enables platform operators to maintain and improve the service.

**Business Value**: Self-service admin reduces operational overhead by 70%. Analytics inform product decisions and ROI measurement.

**Definition of Done**:
- [ ] Admin can view all users and their status
- [ ] AI model/parameters configurable from admin panel
- [ ] Usage analytics dashboard available
- [ ] User roles (Student/Admin) can be assigned

---

## 4. Features (by Épica)

### ÉPICA-01: Plan de Estudios Inteligente con IA

#### FE-01: Generación de Plan con IA
**Description**: Student inputs goals → AI generates complete curriculum with modules, milestones, and suggested timelines.
**Acceptance Criteria**: See US-01 through US-04

#### FE-02: Edición y Personalización del Plan
**Description**: Student can modify AI-generated plans—add/remove modules, adjust timelines, change milestones.
**Acceptance Criteria**: See US-05 through US-07

#### FE-03: Historial de Planes
**Description**: System saves all plan versions, allowing students to compare and restore previous versions.
**Acceptance Criteria**: See US-08 through US-09

---

### ÉPICA-02: Sistema de Gamificación y Motivación

#### FE-04: Sistema de XP y Niveles
**Description**: Students earn XP for completing milestones. XP accumulates toward level thresholds.
**Acceptance Criteria**: See US-10 through US-12

#### FE-05: Rachas de Estudio (Streaks)
**Description**: Daily study activity maintains streak counter. Missing a day breaks the streak with visual/audio feedback.
**Acceptance Criteria**: See US-13 through US-15

#### FE-06: Insignias y Logros
**Description**: Unlockable badges for special accomplishments (first plan, 7-day streak, module completion, etc.).
**Acceptance Criteria**: See US-16 through US-18

---

### ÉPICA-03: Tutor IA Supervisor

#### FE-07: Chat con Tutor IA
**Description**: Real-time chat interface where students can ask questions, get explanations, and receive encouragement.
**Acceptance Criteria**: See US-19 through US-21

#### FE-08: Reportes Automatizados
**Description**: AI generates weekly progress summaries with insights and recommendations.
**Acceptance Criteria**: See US-22 through US-24

#### FE-09: Adaptación Dinámica del Plan
**Description**: AI analyzes performance patterns and suggests or automatically applies plan modifications.
**Acceptance Criteria**: See US-25 through US-26

---

### ÉPICA-04: Módulos y Hitos de Estudio

#### FE-10: Creación de Módulos
**Description**: Modules are thematic units containing related milestones. Visual card-based UI.
**Acceptance Criteria**: See US-27 through US-29

#### FE-11: Hitos (Milestones)
**Description**: Individual checkpoints within modules. Each has title, description, due date, and completion toggle.
**Acceptance Criteria**: See US-30 through US-32

#### FE-12: Recursos Adjuntos
**Description**: Students can attach links, notes, or files to milestones for reference during study.
**Acceptance Criteria**: See US-33 through US-34

---

### ÉPICA-05: Panel de Estudiante (Dashboard)

#### FE-13: Vista General del Progreso
**Description**: Dashboard displays current plan, module progress bars, next milestone, and estimated completion date.
**Acceptance Criteria**: See US-35 through US-37

#### FE-14: Calendario de Rachas
**Description**: Visual calendar showing study activity for the past 30 days. Green for active, gray for missed.
**Acceptance Criteria**: See US-38 through US-39

#### FE-15: Galería de Logros
**Description**: Showcase section displaying earned badges, current level, and motivational stats.
**Acceptance Criteria**: See US-40 through US-41

---

### ÉPICA-06: Gestión Administrativa

#### FE-16: Gestión de Usuarios
**Description**: Admin can view, edit, deactivate, and delete user accounts.
**Acceptance Criteria**: See US-42 through US-44

#### FE-17: Configuración de IA
**Description**: Admin can select AI model, adjust parameters (creativity, verbosity), and set rate limits.
**Acceptance Criteria**: See US-45 through US-46

#### FE-18: Analytics del Sistema
**Description**: Dashboard with metrics: active users, completion rates, AI usage, popular plans.
**Acceptance Criteria**: See US-47 through US-48

---

## 5. User Stories (by Feature)

### Feature: FE-01 - Generación de Plan con IA

#### US-01: Generar plan inicial
**As a**: Student
**I want**: Enter my study goal (e.g., "Learn Spanish to B2 level in 6 months")
**So that**: AI generates a complete, structured study plan

**Acceptance Criteria**:
```
Scenario: Generate study plan successfully
  Given I am logged in as a Student
  And I am on the "Create Plan" page
  When I enter "Learn Spanish to B2 level" in the goal field
  And I select "6 months" from the duration dropdown
  And I enter "2 hours/day" in the available time field
  And I click "Generate Plan"
  Then I should see a loading animation
  And after 5-10 seconds, I should see a complete curriculum
  And the curriculum should include 8-12 modules
  And each module should contain 3-5 milestones

Scenario: Generate plan with empty fields
  Given I am on the "Create Plan" page
  When I click "Generate Plan" without entering a goal
  Then I should see an error message "Please enter a study goal"
  And the plan should not be generated
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-02: Revisar plan generado
**As a**: Student
**I want**: View the AI-generated plan in a clear, organized format
**So that**: I can understand my study path before accepting it

**Acceptance Criteria**:
```
Scenario: View generated plan structure
  Given AI has generated a plan
  Then I should see modules as expandable cards
  And each card should show module title and milestone count
  And I should see a timeline visualization
  And I should see estimated completion dates for each module

Scenario: Expand module details
  Given I am viewing a generated plan
  When I click on a module card
  Then the module should expand to show all milestones
  And each milestone should show title, description, and estimated duration
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-03: Iterar sobre el plan generado
**As a**: Student
**I want**: Request AI to adjust specific parts of the plan
**So that**: The plan better fits my needs without starting over

**Acceptance Criteria**:
```
Scenario: Request AI adjustment
  Given I am viewing a generated plan
  When I click "Adjust" on a specific module
  And I enter "Make this module shorter, I only have 1 hour"
  And I click "Request Adjustment"
  Then I should see the module update within 5 seconds
  And the rest of the plan should remain unchanged
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-04: Aceptar y guardar plan
**As a**: Student
**I want**: Accept the generated plan and save it as my active study plan
**So that**: I can start following it and tracking my progress

**Acceptance Criteria**:
```
Scenario: Accept generated plan
  Given I am satisfied with the generated plan
  When I click "Accept Plan"
  Then the plan should be saved as my active plan
  And I should be redirected to my dashboard
  And I should see the first milestone highlighted
  And I should receive a welcome notification
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

### Feature: FE-02 - Edición y Personalización del Plan

#### US-05: Editar módulo existente
**As a**: Student
**I want**: Edit the title, description, or order of modules in my plan
**So that**: I can customize the curriculum structure

**Acceptance Criteria**:
```
Scenario: Edit module title
  Given I am viewing my active plan
  And I click on a module card
  When I click the "Edit" button
  And I change the title to "Spanish Grammar Fundamentals"
  And I click "Save"
  Then the module title should update immediately
  And I should see a "Saved" confirmation toast
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-06: Agregar módulo personalizado
**As a**: Student
**I want**: Add a new module to my existing plan
**So that**: I can include topics the AI didn't suggest

**Acceptance Criteria**:
```
Scenario: Add new module
  Given I am viewing my active plan
  When I click "+ Add Module" between existing modules
  And I enter "Cultural Immersion" as the title
  And I add 2 milestones
  And I click "Create"
  Then a new module card should appear
  And it should have the correct order position
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-07: Reordenar módulos con drag-and-drop
**As a**: Student
**I want**: Drag and drop modules to change their order
**So that**: I can prioritize topics based on my learning preferences

**Acceptance Criteria**:
```
Scenario: Reorder modules
  Given I am viewing my active plan
  When I drag module 3 above module 1
  Then the modules should animate to their new positions
  And the order should persist after page refresh
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

### Feature: FE-03 - Historial de Planes

#### US-08: Ver versiones anteriores del plan
**As a**: Student
**I want**: View all versions of my plan with timestamps
**So that**: I can see how my plan evolved over time

**Acceptance Criteria**:
```
Scenario: View plan history
  Given I have modified my plan multiple times
  When I click "Plan History" in settings
  Then I should see a list of all versions
  And each entry should show date, time, and summary of changes
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-09: Restaurar versión anterior
**As a**: Student
**I want**: Restore my plan to a previous version
**So that**: I can undo unwanted changes

**Acceptance Criteria**:
```
Scenario: Restore previous version
  Given I am viewing my plan history
  When I click "Restore" on version from March 15
  Then a confirmation dialog should appear
  And after confirming, the plan should revert to that version
  And a new history entry should note the restoration
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 3

---

### Feature: FE-04 - Sistema de XP y Niveles

#### US-10: Ganar XP por completar hitos
**As a**: Student
**I want**: Earn XP when I complete milestones
**So that**: I can see tangible progress and feel rewarded

**Acceptance Criteria**:
```
Scenario: Earn XP for milestone completion
  Given I am working on a milestone
  When I mark the milestone as complete
  Then I should see "+50 XP" animation floating up
  And my total XP should increase by 50
  And I should hear a satisfying "ding" sound

Scenario: XP accumulation to level threshold
  Given I have 850 XP and need 1000 for Level 5
  When I complete a milestone worth 200 XP
  Then my total should be 1050 XP
  And I should reach Level 5
  And a celebration animation should play
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-11: Visualizar nivel actual
**As a**: Student
**I want**: See my current level and progress to the next level
**So that**: I stay motivated to level up

**Acceptance Criteria**:
```
Scenario: Display level progress
  Given I am logged in
  Then I should see my level badge (e.g., "Level 4") in the header
  And I should see a progress bar showing XP toward Level 5
  And the progress bar should be 85% filled (850/1000 XP)

Scenario: Level badge styling
  Given I am Level 4
  Then the badge should be gold colored
  And Level 5 should have a special glow animation
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-12: Usar XP para desbloquear recompensas
**As a**: Student
**I want**: Spend XP to unlock cosmetic rewards or features
**So that**: XP feels meaningful beyond just numbers

**Acceptance Criteria**:
```
Scenario: Unlock avatar customization
  Given I have 500 XP
  And I am on the Rewards shop page
  When I click on a "Premium Avatar Frame" costing 300 XP
  And I click "Unlock"
  Then 300 XP should be deducted
  And the avatar frame should be available in my profile settings
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

### Feature: FE-05 - Rachas de Estudio (Streaks)

#### US-13: Iniciar racha con actividad diaria
**As a**: Student
**I want**: Complete at least one milestone per day to maintain my streak
**So that**: I build consistent study habits

**Acceptance Criteria**:
```
Scenario: Start a new streak
  Given I have not studied today
  When I complete any milestone
  Then my streak counter should increase by 1
  And I should see "Day 1" celebration animation
  And the streak flame icon should appear

Scenario: Maintain streak with daily activity
  Given I have a 5-day streak
  When I complete a milestone on the 6th day
  Then my streak should become 6 days
  And I should see a mini celebration
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-14: Perder racha por inactividad
**As a**: Student
**I want**: See my streak reset to 0 if I miss a day
**So that**: I understand the importance of daily consistency

**Acceptance Criteria**:
```
Scenario: Streak breaks after missed day
  Given I have a 10-day streak
  And I do not complete any milestone today before midnight
  When a new day begins
  Then my streak should reset to 0
  And I should see a sad animation of the flame going out
  And I should receive a notification encouraging me to restart

Scenario: Streak preservation notice
  Given I have a 7-day streak
  And it is 10 PM with no activity today
  When I log in
  Then I should see "Don't lose your 7-day streak! Complete a milestone to save it."
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-15: Protección de racha (freeze)
**As a**: Student
**I want**: Use a streak freeze to protect my streak for one missed day
**So that**: Unexpected circumstances don't break my momentum

**Acceptance Criteria**:
```
Scenario: Use streak freeze
  Given I have earned 2 streak freezes
  And I miss a day
  When the system detects no activity at midnight
  Then one freeze should be automatically used
  And my streak should remain intact
  And I should see "Streak protected!" notification
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

### Feature: FE-06 - Insignias y Logros

#### US-16: Desbloquear insignia por hitos
**As a**: Student
**I want**: Earn badges for significant accomplishments
**So that**: I feel recognized for my achievements

**Acceptance Criteria**:
```
Scenario: Unlock "First Steps" badge
  Given I complete my very first milestone
  Then the "First Steps" badge should unlock
  And I should see a badge unlock animation
  And a notification should say "Achievement unlocked: First Steps!"

Scenario: Unlock "Week Warrior" badge
  Given I maintain a 7-day streak
  Then the "Week Warrior" badge should unlock
  And it should appear in my profile
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-17: Ver colección de insignias
**As a**: Student
**I want**: View all my earned and locked badges
**So that**: I can track my accomplishments and see what to unlock next

**Acceptance Criteria**:
```
Scenario: View badge collection
  Given I am on my profile page
  When I click "Badges" tab
  Then I should see earned badges in full color
  And locked badges should appear grayed out
  And each badge should show name and how to unlock
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-18: Compartir insignia en redes
**As a**: Student
**I want**: Share my badge achievements on social media
**So that**: My friends can celebrate with me and I promote the app

**Acceptance Criteria**:
```
Scenario: Share badge to Twitter
  Given I just unlocked the "Month Master" badge
  When I click the share icon on the badge
  And I select "Twitter"
  Then a tweet should open with achievement text and app link
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

### Feature: FE-07 - Chat con Tutor IA

#### US-19: Iniciar conversación con IA Tutor
**As a**: Student
**I want**: Open a chat window to talk with my AI Tutor
**So that**: I can ask questions and get guidance

**Acceptance Criteria**:
```
Scenario: Open AI Tutor chat
  Given I am on the dashboard
  When I click the "Tutor" button in the bottom corner
  Then a chat panel should slide in from the right
  And I should see "Hi! I'm your AI Tutor. How can I help you today?"
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-20: Recibir ayuda contextual
**As a**: Student
**I want**: Get explanations and help specific to my current study topic
**So that**: I can understand difficult concepts without leaving the app

**Acceptance Criteria**:
```
Scenario: Ask about current module
  Given I am studying "Spanish Verb Conjugation" module
  When I ask "Can you explain the difference between ser and estar?"
  Then AI Tutor should respond with a clear explanation
  And the response should include examples
  And the response should be under 200 words
```

**Estimates**:
- Complexity: High
- Estimated Points: 8

---

#### US-21: Recibir aliento y motivación
**As a**: Student
**I want**: Get encouragement from AI Tutor when I'm struggling
**So that**: I stay motivated and don't give up

**Acceptance Criteria**:
```
Scenario: Receive motivational message
  Given I have missed 3 milestones in a row
  When I open the AI Tutor chat
  Then the tutor should say "I noticed you've had a tough time lately. That's okay! Remember why you started. Want me to adjust your plan to be more manageable?"
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

### Feature: FE-08 - Reportes Automatizados

#### US-22: Recibir resumen semanal
**As a**: Student
**I want**: Get a weekly progress summary from AI Tutor every Sunday
**So that**: I can reflect on my progress and plan the week ahead

**Acceptance Criteria**:
```
Scenario: Receive weekly summary
  Given it is Sunday at 6 PM
  When the system generates my weekly summary
  Then I should receive a notification "Your weekly summary is ready!"
  And the summary should show: milestones completed, time studied, streak status
  And it should include AI insights and recommendations for next week
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-23: Ver estadísticas de progreso
**As a**: Student
**I want**: View detailed stats about my study habits
**So that**: I can identify patterns and improve

**Acceptance Criteria**:
```
Scenario: View study statistics
  Given I am on the dashboard
  When I click "View Stats"
  Then I should see: total study time, average daily time, completion rate, strongest/weakest days
  And I should see a chart of study activity over the past month
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-24: Comparar progreso con objetivos
**As a**: Student
**I want**: See how my actual progress compares to my original plan
**So that**: I know if I'm ahead, on track, or behind

**Acceptance Criteria**:
```
Scenario: View progress comparison
  Given my plan started 2 weeks ago
  When I open the progress comparison view
  Then I should see a timeline with planned vs. actual milestones
  And ahead items should be green, on-track yellow, behind red
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

### Feature: FE-09 - Adaptación Dinámica del Plan

#### US-25: Recibir recomendaciones de ajuste
**As a**: Student
**I want**: Get suggestions from AI to modify my plan based on my performance
**So that**: My plan stays realistic and achievable

**Acceptance Criteria**:
```
Scenario: AI suggests plan adjustment
  Given I have consistently missed deadlines for "Listening Practice" module
  When AI analyzes my performance
  Then I should receive a suggestion: "You're struggling with listening. Want me to add more practice exercises and extend the deadline?"
```

**Estimates**:
- Complexity: High
- Estimated Points: 8

---

#### US-26: Aceptar ajuste automático
**As a**: Student
**I want**: Allow AI to automatically adjust my plan without asking
**So that**: I don't have to manually update everything

**Acceptance Criteria**:
```
Scenario: Auto-adjustment enabled
  Given I have enabled "Auto-adjust plans" in settings
  And I miss 2 consecutive milestones
  When AI detects the pattern
  Then the plan should automatically extend deadlines
  And I should receive a notification explaining the change
```

**Estimates**:
- Complexity: High
- Estimated Points: 8

---

### Feature: FE-10 - Creación de Módulos

#### US-27: Ver módulos como tarjetas visuales
**As a**: Student
**I want**: See my curriculum as visual module cards
**So that**: I can quickly understand the scope of my plan

**Acceptance Criteria**:
```
Scenario: Display module cards
  Given I have a plan with 5 modules
  When I open my plan view
  Then each module should appear as a card
  And each card should show: title, progress bar, milestone count, status icon
  And cards should be ordered sequentially
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-28: Ver progreso del módulo
**As a**: Student
**I want**: See how much of each module I've completed
**So that**: I know which modules need attention

**Acceptance Criteria**:
```
Scenario: Module progress indicator
  Given I have completed 3 of 5 milestones in Module 2
  Then the module card should show "3/5 milestones"
  And the progress bar should be 60% filled
  And the card border should be blue
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-29: Módulo completado con animación
**As a**: Student
**I want**: See a celebration when I complete a module
**So that**: Completing modules feels rewarding

**Acceptance Criteria**:
```
Scenario: Module completion celebration
  Given I complete the final milestone in a module
  Then the module card should turn green
  And a confetti animation should play
  And I should hear victory sound
  And a "Module Complete!" banner should appear
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 3

---

### Feature: FE-11 - Hitos (Milestones)

#### US-30: Marcar hito como completado
**As a**: Student
**I want**: Click to mark a milestone as done
**So that**: I can track my daily progress

**Acceptance Criteria**:
```
Scenario: Complete a milestone
  Given I am viewing a module with pending milestones
  When I click the checkbox next to a milestone
  Then the checkbox should be checked with a checkmark
  And the milestone text should be slightly grayed out
  And I should earn XP (as per US-10)
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-31: Ver detalles del hito
**As a**: Student
**I want**: Click on a milestone to see full details
**So that**: I understand what I need to do

**Acceptance Criteria**:
```
Scenario: View milestone details
  Given I click on a milestone
  Then a modal should open showing: title, description, suggested duration, attached resources, due date
  And I should have option to edit or delete the milestone
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-32: Añadir fecha de vencimiento
**As a**: Student
**I want**: Set a due date for each milestone
**So that**: I have clear deadlines to work toward

**Acceptance Criteria**:
```
Scenario: Set milestone due date
  Given I am editing a milestone
  When I click on the date field
  Then a calendar picker should appear
  And I should select a date
  And the date should display on the milestone card
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

### Feature: FE-12 - Recursos Adjuntos

#### US-33: Adjuntar enlace a hito
**As a**: Student
**I want**: Add URL links to milestones
**So that**: I can easily access study materials

**Acceptance Criteria**:
```
Scenario: Attach link to milestone
  Given I am editing a milestone
  When I click "Add Resource"
  And I paste a YouTube URL
  And I enter "Spanish Verb Tenses Video"
  Then the link should appear under the milestone
  And clicking it should open in a new tab
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-34: Adjuntar notas personales
**As a**: Student
**I want**: Add personal notes to milestones
**So that**: I can capture thoughts and learnings

**Acceptance Criteria**:
```
Scenario: Add notes to milestone
  Given I am viewing a milestone
  When I click "Add Notes"
  And I type "Remember: ser = permanent, estar = temporary"
  And I click "Save"
  Then the note should appear as a collapsible section
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

### Feature: FE-13 - Vista General del Progreso

#### US-35: Ver progreso general del plan
**As a**: Student
**I want**: See my overall plan completion percentage
**So that**: I know how far I've come

**Acceptance Criteria**:
```
Scenario: Display overall progress
  Given I have a plan with 40 total milestones
  And I have completed 12
  When I view the dashboard
  Then I should see "30% Complete" with a circular progress indicator
  And the indicator should be animated
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-36: Ver próximo hito
**As a**: Student
**I want**: See what I need to do next at a glance
**So that**: I can start studying immediately

**Acceptance Criteria**:
```
Scenario: Highlight next milestone
  Given I am on the dashboard
  Then the "Next Up" section should show the immediate next milestone
  And it should have a "Start" button
  And it should show estimated time to complete
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-37: Ver fecha estimada de finalización
**As a**: Student
**I want**: See when I will finish my plan based on current pace
**So that**: I can set expectations

**Acceptance Criteria**:
```
Scenario: Show estimated completion
  Given I have been studying for 2 weeks
  When the AI calculates my completion estimate
  Then I should see "Estimated completion: May 15, 2026"
  And the date should update as my pace changes
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 3

---

### Feature: FE-14 - Calendario de Rachas

#### US-38: Ver calendario de actividad
**As a**: Student
**I want**: See my study activity as a calendar heatmap
**So that**: I can visualize my consistency

**Acceptance Criteria**:
```
Scenario: Display activity calendar
  Given I am on the dashboard
  When I scroll to the streak section
  Then I should see a 30-day calendar grid
  And each day should show: green (studied), gray (missed), highlighted (today)
  And the streak count should be prominently displayed
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-39: Ver historial de rachas anteriores
**As a**: Student
**I want**: See my best streak and streak history
**So that**: I can try to beat my records

**Acceptance Criteria**:
```
Scenario: Show streak history
  Given I have had multiple streaks over time
  When I click "Streak History"
  Then I should see a list of all streaks with start/end dates
  And "Best Streak: 21 days" should be highlighted
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

### Feature: FE-15 - Galería de Logros

#### US-40: Ver logros recientes
**As a**: Student
**I want**: See my most recent achievements on the dashboard
**So that**: I feel recognized for my efforts

**Acceptance Criteria**:
```
Scenario: Display recent achievements
  Given I have recent unlocks
  When I view the dashboard
  Then the "Recent Achievements" section should show my last 3 unlocks
  And each should display badge icon and date earned
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-41: Ver estadísticas motivacionales
**As a**: Student
**I want**: See encouraging stats like "You've studied for X hours!"
**So that**: I feel proud of my cumulative effort

**Acceptance Criteria**:
```
Scenario: Show motivational stats
  Given I have studied consistently
  When I view my profile
  Then I should see stats like: "47 hours total study time", "23 days active", "Keep it up!"
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

### Feature: FE-16 - Gestión de Usuarios

#### US-42: Ver lista de usuarios
**As a**: Administrator
**I want**: See all registered users in a searchable list
**So that**: I can manage the platform effectively

**Acceptance Criteria**:
```
Scenario: View user list
  Given I am logged in as Admin
  When I navigate to Users section
  Then I should see a table with: name, email, status, plan, join date
  And I should be able to search by name or email
  And I should be able to filter by status (active/inactive)
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

#### US-43: Editar usuario
**As a**: Administrator
**I want**: Edit user details and account status
**So that**: I can manage user access and data

**Acceptance Criteria**:
```
Scenario: Deactivate user account
  Given I am viewing a user account
  When I click "Deactivate"
  Then the user's status should change to "Inactive"
  And the user should not be able to log in
  And I should see confirmation "User deactivated successfully"
```

**Estimates**:
- Complexity: Low
- Estimated Points: 2

---

#### US-44: Ver actividad de usuario
**As a**: Administrator
**I want**: View a specific user's activity and progress
**So that**: I can help troubleshoot issues

**Acceptance Criteria**:
```
Scenario: View user activity
  Given I am viewing a user profile
  When I click "View Activity"
  Then I should see their plan progress, streak, milestones completed, AI usage
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 3

---

### Feature: FE-17 - Configuración de IA

#### US-45: Seleccionar modelo de IA
**As a**: Administrator
**I want**: Choose which AI model powers the Tutor feature
**So that**: I can optimize for cost, speed, or quality

**Acceptance Criteria**:
```
Scenario: Change AI model
  Given I am in AI Settings
  When I select "GPT-4o Mini" from the model dropdown
  And I click "Save"
  Then the AI Tutor should use the selected model for new requests
  And I should see confirmation "AI model updated"
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-46: Configurar parámetros de IA
**As a**: Administrator
**I want**: Adjust AI behavior parameters (creativity, verbosity, tone)
**So that**: The AI Tutor matches our brand voice

**Acceptance Criteria**:
```
Scenario: Adjust AI verbosity
  Given I am in AI Settings
  When I set "Response Length" to "Concise"
  And I set "Tone" to "Encouraging"
  And I click "Save"
  Then new AI responses should be shorter and more motivational
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

### Feature: FE-18 - Analytics del Sistema

#### US-47: Ver métricas de uso
**As a**: Administrator
**I want**: See platform-wide analytics (DAU, MAU, completion rates)
**So that**: I can measure platform health

**Acceptance Criteria**:
```
Scenario: View usage metrics
  Given I am on the Analytics dashboard
  Then I should see: Daily Active Users, Monthly Active Users, Plan completion rate, Average streak
  And metrics should update in real-time
  And I should see trend arrows (up/down)
```

**Estimates**:
- Complexity: Medium
- Estimated Points: 5

---

#### US-48: Exportar reportes
**As a**: Administrator
**I want**: Export analytics data as CSV or PDF
**So that**: I can share reports with stakeholders

**Acceptance Criteria**:
```
Scenario: Export analytics report
  Given I am viewing analytics
  When I click "Export"
  And I select "CSV" format
  Then a download should start with the current data
  And the file should be named "studyplanai-analytics-YYYY-MM-DD.csv"
```

**Estimates**:
- Complexity: Low
- Estimated Points: 3

---

## 6. Non-Functional Requirements

### Performance
| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page load time | < 2 seconds | Lighthouse audit |
| AI response time | < 10 seconds for plan generation | APM monitoring |
| Dashboard render | < 500ms | Performance API |
| Mobile responsive | 100% functional on iOS/Android | Manual testing |

### Security
| Requirement | Description |
|-------------|-------------|
| Authentication | JWT-based auth with refresh tokens |
| Data encryption | All data encrypted at rest (AES-256) |
| API security | Rate limiting, input validation, CORS |
| Privacy | GDPR-compliant data handling |

### Usability
| Requirement | Description |
|-------------|-------------|
| Accessibility | WCAG 2.1 AA compliance |
| Onboarding | New user tutorial < 3 minutes |
| Error handling | User-friendly error messages, no technical jargon |
| Offline support | Basic plan viewing available offline |

### Availability
| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% SLA |
| Support response | < 24 hours for critical issues |

---

## 7. Dependencies & Constraints

### External Dependencies
| Dependency | Description | Risk if Delayed |
|------------|-------------|-----------------|
| OpenRouter API | AI model provider (free tier available) | Core feature impacted |
| React libraries | UI component ecosystem | Low risk, alternatives exist |
| Node.js ecosystem | Backend runtime and packages | Low risk |

### Technical Constraints
| Constraint | Description | Impact |
|------------|-------------|--------|
| Free AI only | Must use free-tier AI APIs | May need caching/smart usage |
| No native app initially | Web-only MVP | Limited offline capability |
| Single database | No microservices initially | Scalability limits |

### Business Rules
| Rule | Description | Applies To |
|------|-------------|------------|
| Free tier | Basic features always free | All users |
| XP cannot be sold | XP is earned, not purchased | Students |
| One active plan | Students can have only one active study plan | Students |

---

## 8. Out of Scope

The following are explicitly NOT included in this release:
- Native mobile apps (iOS/Android) — web-only MVP
- Social features (study groups, leaderboards) — future release
- Payment/pro subscription system — future release
- Multi-language support — English only initially
- AI-generated study materials/content — only plan structure
- Integration with external LMS platforms

---

## Appendix: Story Metrics

| Metric | Value |
|--------|-------|
| Total Épicas | 6 |
| Total Features | 18 |
| Total User Stories | 48 |
| Total Estimated Points | 176 |
| Estimated Sprint Count | ~8 sprints (2-week sprints, velocity ~22) |

---

*(End of document)*
