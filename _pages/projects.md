---
layout: page
title: projects
permalink: /projects/
nav: true
nav_order: 3
#display_categories: [work, fun]
#horizontal: true
---

<style>
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.project-list-link {
  text-decoration: none;
  color: inherit;
}

.project-list-link:hover {
  text-decoration: none;
  color: inherit;
}

.project-list-card {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 170px;

  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 4px;

  overflow: hidden;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);

  background: var(--global-bg-color);
}

.project-list-image {
  flex: 0 0 190px;
  width: 190px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 12px;
}

.project-list-image picture {
  width: 100%;
  height: 100%;
}

.project-list-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.project-list-content {
  flex: 1;
  padding: 1.25rem 1.5rem;
}

.project-list-title {
  margin: 0 0 0.4rem 0;
  font-size: 1.55rem;
  line-height: 1.25;
}

.project-list-description {
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .project-list-card {
    flex-direction: column;
    align-items: stretch;
  }

  .project-list-image {
    width: 100%;
    height: 180px;
    flex-basis: auto;
  }

  .project-list-content {
    padding: 1rem;
  }
}
</style>

<div class="projects-list">

{% assign sorted_projects = site.projects | sort: "importance" %}

{% for project in sorted_projects %}

  {% if project.redirect %}
    {% assign project_url = project.redirect %}
  {% else %}
    {% assign project_url = project.url | relative_url %}
  {% endif %}

  <a href="{{ project_url }}" class="project-list-link">
    <div class="project-list-card">

      {% if project.img %}
        <div class="project-list-image">
          {% include figure.liquid
            loading="lazy"
            path=project.img
            class="project-list-thumbnail"
            alt=project.title
          %}
        </div>
      {% endif %}

      <div class="project-list-content">
        <h2 class="project-list-title">
          {{ project.title }}
        </h2>

        {% if project.description %}
          <p class="project-list-description">
            {{ project.description }}
          </p>
        {% endif %}
      </div>

    </div>
  </a>

{% endfor %}

</div>
