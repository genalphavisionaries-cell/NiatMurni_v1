/**
 * Strict validation for CMS payload to ensure data integrity
 * and provide safe empty fallbacks (NOT fake content).
 */

import type { PublicCmsPayload, PublicCmsHomepageSection } from "./public-cms";
import { cmsString } from "./public-cms";

export type ValidationError = {
  section: string;
  field: string;
  message: string;
  severity: "error" | "warning";
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  payload: PublicCmsPayload;
};

function createError(section: string, field: string, message: string, severity: "error" | "warning" = "error"): ValidationError {
  return { section, field, message, severity };
}

function validateHeroSection(section: PublicCmsHomepageSection | null | undefined): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!section) {
    errors.push(createError("hero", "section", "Hero section is missing"));
    return errors;
  }

  if (!cmsString(section.title)) {
    errors.push(createError("hero", "title", "Hero title is required", "warning"));
  }

  if (!cmsString(section.subtitle) && !cmsString(section.description)) {
    errors.push(createError("hero", "subtitle", "Hero subtitle or description is required", "warning"));
  }

  if (!cmsString(section.image_url)) {
    errors.push(createError("hero", "image_url", "Hero background image is missing", "warning"));
  }

  return errors;
}

function validateWhyChooseUsSection(sections: PublicCmsHomepageSection[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const whySection = sections.find(s => 
    s.section_key === "why_choose_us" || s.section_key === "usp" || s.section_key === "features"
  );

  if (!whySection) {
    errors.push(createError("why_choose_us", "section", "Why choose us section is missing"));
    return errors;
  }

  if (!cmsString(whySection.title)) {
    errors.push(createError("why_choose_us", "title", "Why choose us title is required", "warning"));
  }

  const itemsJson = whySection.extra_data?.items_json;
  if (!itemsJson) {
    errors.push(createError("why_choose_us", "items_json", "Why choose us items are missing", "warning"));
  } else {
    try {
      const items = JSON.parse(itemsJson);
      if (!Array.isArray(items) || items.length === 0) {
        errors.push(createError("why_choose_us", "items_json", "Why choose us has no valid items", "warning"));
      }
    } catch {
      errors.push(createError("why_choose_us", "items_json", "Why choose us items JSON is malformed"));
    }
  }

  return errors;
}

function validateTestimonialsSection(sections: PublicCmsHomepageSection[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const testimonialSection = sections.find(s => 
    s.section_key === "testimonials" || s.section_key === "trust"
  );

  if (!testimonialSection) {
    errors.push(createError("testimonials", "section", "Testimonials section is missing"));
    return errors;
  }

  if (!cmsString(testimonialSection.title)) {
    errors.push(createError("testimonials", "title", "Testimonials title is required", "warning"));
  }

  const itemsJson = testimonialSection.extra_data?.items_json;
  if (itemsJson) {
    try {
      const items = JSON.parse(itemsJson);
      if (Array.isArray(items)) {
        items.forEach((item, idx) => {
          if (!item.name || !item.review) {
            errors.push(createError("testimonials", `items[${idx}]`, "Testimonial missing name or review", "warning"));
          }
        });
      }
    } catch {
      errors.push(createError("testimonials", "items_json", "Testimonials items JSON is malformed"));
    }
  }

  return errors;
}

function validateCtaSection(sections: PublicCmsHomepageSection[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const ctaSection = sections.find(s => 
    s.section_key === "cta" || s.section_key === "promo"
  );

  if (!ctaSection) {
    errors.push(createError("cta", "section", "CTA/Promotions section is missing"));
    return errors;
  }

  if (!cmsString(ctaSection.title)) {
    errors.push(createError("cta", "title", "CTA title is required", "warning"));
  }

  const promosJson = ctaSection.extra_data?.promos_json;
  if (promosJson) {
    try {
      const promos = JSON.parse(promosJson);
      if (Array.isArray(promos)) {
        promos.forEach((promo, idx) => {
          if (!promo.title && !promo.description) {
            errors.push(createError("cta", `promos[${idx}]`, "Promo missing title and description", "warning"));
          }
        });
      }
    } catch {
      errors.push(createError("cta", "promos_json", "Promotions JSON is malformed"));
    }
  }

  return errors;
}

function validateFooterSection(payload: PublicCmsPayload): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!payload.footer) {
    errors.push(createError("footer", "section", "Footer data is missing"));
    return errors;
  }

  if (!payload.navigation?.footer_legal || payload.navigation.footer_legal.length === 0) {
    errors.push(createError("footer", "footer_legal", "Footer legal links are missing", "warning"));
  }

  if (!payload.navigation?.footer_login || payload.navigation.footer_login.length === 0) {
    errors.push(createError("footer", "footer_login", "Footer login links are missing", "warning"));
  }

  return errors;
}

function createSafeEmptySection(sectionKey: string, sortOrder: number): PublicCmsHomepageSection {
  return {
    section_key: sectionKey,
    name: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
    sort_order: sortOrder,
    title: null,
    subtitle: null,
    description: null,
    image_url: null,
    button_primary_label: null,
    button_primary_url: null,
    button_secondary_label: null,
    button_secondary_url: null,
    extra_data: null,
  };
}

function createSafeEmptyPayload(): PublicCmsPayload {
  return {
    site: {
      site_name: "",
      site_tagline: "",
      logo_url: "",
      favicon_url: "",
      primary_cta_label: "",
      primary_cta_url: "",
    },
    theme: {
      primary_color: "#2563EB",
      secondary_color: "#64748B",
      accent_color: "#F59E0B",
      background_color: "",
      text_color: "",
      header_background_color: "",
      footer_background_color: "",
    },
    seo: {
      homepage_seo_title: "",
      homepage_seo_description: "",
      homepage_og_image_url: "",
      default_seo_title: "",
      default_seo_description: "",
    },
    footer: {
      description: "",
      bottom_text: "",
      show_payment_card: true,
      payment_headline: "",
      ssl_badge_url: "",
      ssl_caption: "",
    },
    contact: {
      email: "",
      phone: "",
      address: "",
    },
    social: {
      facebook_url: "",
      instagram_url: "",
      linkedin_url: "",
    },
    navigation: {
      header: [],
      footer: [],
      footer_legal: [],
      footer_login: [],
    },
    homepage_sections: [],
    hero: null,
    last_updated: null,
    floating_menu: {
      enabled: false,
      items: [],
    },
  };
}

export function validateCmsPayload(payload: PublicCmsPayload | null): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!payload) {
    const safePayload = createSafeEmptyPayload();
    errors.push(createError("payload", "root", "CMS payload is null"));
    
    if (process.env.NODE_ENV === "development") {
      console.error("CMS VALIDATION: Payload is null, using safe empty structure");
    }
    
    return {
      isValid: false,
      errors,
      payload: safePayload,
    };
  }

  // Validate core structure
  if (!payload.site) {
    errors.push(createError("site", "section", "Site configuration is missing"));
  }
  
  if (!payload.navigation) {
    errors.push(createError("navigation", "section", "Navigation data is missing"));
  }

  // Validate homepage sections
  const sections = payload.homepage_sections || [];
  
  errors.push(...validateHeroSection(payload.hero));
  errors.push(...validateWhyChooseUsSection(sections));
  errors.push(...validateTestimonialsSection(sections));
  errors.push(...validateCtaSection(sections));
  errors.push(...validateFooterSection(payload));

  // Create safe payload with empty sections for missing critical data
  let safePayload = { ...payload };
  
  const criticalErrors = errors.filter(e => e.severity === "error");
  if (criticalErrors.length > 0) {
    // Add safe empty sections for missing critical sections
    const missingSections: PublicCmsHomepageSection[] = [];
    
    if (criticalErrors.some(e => e.section === "hero")) {
      missingSections.push(createSafeEmptySection("hero", 0));
      safePayload.hero = missingSections[0];
    }
    
    if (criticalErrors.some(e => e.section === "why_choose_us")) {
      missingSections.push(createSafeEmptySection("why_choose_us", 1));
    }
    
    if (criticalErrors.some(e => e.section === "testimonials")) {
      missingSections.push(createSafeEmptySection("testimonials", 3));
    }
    
    if (criticalErrors.some(e => e.section === "cta")) {
      missingSections.push(createSafeEmptySection("cta", 4));
    }
    
    safePayload.homepage_sections = [...sections, ...missingSections];
  }

  // Log validation results in development
  if (process.env.NODE_ENV === "development") {
    const errorCount = errors.filter(e => e.severity === "error").length;
    const warningCount = errors.filter(e => e.severity === "warning").length;
    
    if (errorCount > 0) {
      console.error(`CMS VALIDATION: ${errorCount} errors, ${warningCount} warnings`);
      errors.forEach(error => {
        if (error.severity === "error") {
          console.error(`  ERROR [${error.section}.${error.field}]: ${error.message}`);
        }
      });
    } else if (warningCount > 0) {
      console.warn(`CMS VALIDATION: ${warningCount} warnings`);
      errors.forEach(error => {
        if (error.severity === "warning") {
          console.warn(`  WARN [${error.section}.${error.field}]: ${error.message}`);
        }
      });
    }
  }

  return {
    isValid: criticalErrors.length === 0,
    errors,
    payload: safePayload,
  };
}