---
layout: page
title: projects
permalink: /projects/
nav: true
nav_order: 3
#display_categories: [work, fun]
#horizontal: true
---

<link rel="stylesheet" href="{{ '/assets/css/images.css' | relative_url }}">

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
