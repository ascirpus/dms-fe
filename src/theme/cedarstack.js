import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * CedarStack Theme Preset
 * Based on Figma design tokens
 */
const CedarStack = definePreset(Aura, {
    // Semantic design tokens
    semantic: {
        // Primary colors
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        },

        // Color scheme for light/dark modes
        colorScheme: {
            light: {
                // Surface colors
                surface: {
                    0: '#ffffff',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617'
                },
                // Content/Card background
                content: {
                    background: '#ffffff'
                },
                // Primary action color (dark buttons)
                primary: {
                    color: '#040711',
                    contrastColor: '#ffffff',
                    hoverColor: '#1e293b',
                    activeColor: '#334155'
                },
                // Text colors
                text: {
                    color: '#1e293b',
                    hoverColor: '#0f172a',
                    mutedColor: '#64748b',
                    hoverMutedColor: '#475569'
                },
                // Form colors
                formField: {
                    background: '#ffffff',
                    disabledBackground: '#f1f5f9',
                    filledBackground: '#f8fafc',
                    filledHoverBackground: '#f1f5f9',
                    filledFocusBackground: '#ffffff',
                    borderColor: '#cdd5e0',
                    hoverBorderColor: '#94a3b8',
                    focusBorderColor: '#3b82f6',
                    invalidBorderColor: '#e74c3c',
                    color: '#1e293b',
                    disabledColor: '#94a3b8',
                    placeholderColor: '#94a3b8',
                    invalidPlaceholderColor: '#e74c3c',
                    floatLabelColor: '#64748b',
                    floatLabelFocusColor: '#3b82f6',
                    floatLabelActiveColor: '#64748b',
                    floatLabelInvalidColor: '#e74c3c',
                    iconColor: '#64748b',
                    shadow: 'none'
                }
            },
            dark: {
                // Surface palette must go light→dark (0→950) so Aura's
                // semantic token references like {surface.800} resolve to
                // dark colors, not light ones.
                surface: {
                    0: '#ffffff',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617'
                },
                content: {
                    background: '{surface.800}',
                    hoverBackground: '{surface.700}',
                    borderColor: '{surface.600}',
                    color: '{text.color}',
                    hoverColor: '{text.hover.color}'
                },
                overlay: {
                    select: {
                        background: '{surface.800}',
                        borderColor: '{surface.600}',
                        color: '{text.color}'
                    },
                    popover: {
                        background: '{surface.800}',
                        borderColor: '{surface.600}',
                        color: '{text.color}'
                    },
                    modal: {
                        background: '{surface.800}',
                        borderColor: '{surface.600}',
                        color: '{text.color}'
                    }
                },
                list: {
                    option: {
                        focusBackground: '{surface.700}',
                        color: '{text.color}',
                        focusColor: '{text.hover.color}'
                    }
                },
                navigation: {
                    item: {
                        focusBackground: '{surface.700}',
                        activeBackground: '{surface.700}',
                        color: '{text.color}',
                        focusColor: '{text.hover.color}',
                        activeColor: '{text.hover.color}'
                    }
                },
                primary: {
                    color: '#3b82f6',
                    contrastColor: '#ffffff',
                    hoverColor: '#2563eb',
                    activeColor: '#1d4ed8'
                },
                text: {
                    color: '#f8fafc',
                    hoverColor: '#ffffff',
                    mutedColor: '#cbd5e1',
                    hoverMutedColor: '#e2e8f0'
                },
                formField: {
                    background: '{surface.800}',
                    disabledBackground: '{surface.700}',
                    filledBackground: '{surface.700}',
                    filledHoverBackground: '{surface.600}',
                    filledFocusBackground: '{surface.800}',
                    borderColor: '{surface.600}',
                    hoverBorderColor: '{surface.500}',
                    focusBorderColor: '#3b82f6',
                    invalidBorderColor: '#e74c3c',
                    color: '#f8fafc',
                    disabledColor: '#64748b',
                    placeholderColor: '#94a3b8',
                    invalidPlaceholderColor: '#e74c3c',
                    floatLabelColor: '#94a3b8',
                    floatLabelFocusColor: '#3b82f6',
                    floatLabelActiveColor: '#94a3b8',
                    floatLabelInvalidColor: '#e74c3c',
                    iconColor: '#94a3b8',
                    shadow: 'none'
                }
            }
        }
    },

    // Component-specific tokens
    components: {
        inputtext: {
            borderRadius: '6px',
            paddingX: '12px',
            paddingY: '8px',
            sm: {
                fontSize: '0.875rem',
                paddingX: '10px',
                paddingY: '6px'
            },
            lg: {
                fontSize: '1rem',
                paddingX: '14px',
                paddingY: '10px'
            }
        },
        button: {
            borderRadius: '4px',
            paddingX: '16px',
            paddingY: '8px',
            gap: '6px',
            fontWeight: '500',
            sm: {
                fontSize: '0.875rem',
                paddingX: '12px',
                paddingY: '6px'
            },
            lg: {
                fontSize: '1rem',
                paddingX: '20px',
                paddingY: '10px'
            },
            // Primary button (dark)
            colorScheme: {
                light: {
                    root: {
                        background: '#040711',
                        hoverBackground: '#1e293b',
                        activeBackground: '#334155',
                        borderColor: '#040711',
                        hoverBorderColor: '#1e293b',
                        activeBorderColor: '#334155',
                        color: '#ffffff',
                        hoverColor: '#ffffff',
                        activeColor: '#ffffff'
                    },
                    text: {
                        primary: {
                            color: '#3b82f6',
                            hoverColor: '#2563eb',
                            activeColor: '#1d4ed8'
                        }
                    },
                    outlined: {
                        primary: {
                            borderColor: '#040711',
                            hoverBackground: 'rgba(4, 7, 17, 0.04)',
                            color: '#040711'
                        }
                    },
                    link: {
                        color: '#3b82f6',
                        hoverColor: '#2563eb',
                        activeColor: '#1d4ed8'
                    }
                },
                dark: {
                    root: {
                        background: '#3b82f6',
                        hoverBackground: '#2563eb',
                        activeBackground: '#1d4ed8',
                        borderColor: '#3b82f6',
                        hoverBorderColor: '#2563eb',
                        activeBorderColor: '#1d4ed8',
                        color: '#ffffff',
                        hoverColor: '#ffffff',
                        activeColor: '#ffffff'
                    },
                    text: {
                        primary: {
                            color: '#60a5fa',
                            hoverColor: '#93c5fd',
                            activeColor: '#bfdbfe'
                        }
                    },
                    link: {
                        color: '#60a5fa',
                        hoverColor: '#93c5fd',
                        activeColor: '#bfdbfe'
                    }
                }
            }
        },
        message: {
            borderRadius: '6px',
            colorScheme: {
                light: {
                    error: {
                        background: '#fef2f2',
                        borderColor: '#fecaca',
                        color: '#dc2626'
                    },
                    success: {
                        background: '#f0fdf4',
                        borderColor: '#bbf7d0',
                        color: '#16a34a'
                    },
                    warn: {
                        background: '#fffbeb',
                        borderColor: '#fde68a',
                        color: '#d97706'
                    },
                    info: {
                        background: '#eff6ff',
                        borderColor: '#bfdbfe',
                        color: '#2563eb'
                    }
                }
            }
        },
        card: {
            borderRadius: '8px',
            colorScheme: {
                light: {
                    root: {
                        background: '#ffffff',
                        color: '#1e293b'
                    },
                    subtitle: {
                        color: '#64748b'
                    }
                },
                dark: {
                    root: {
                        background: '#1e293b',
                        color: '#f8fafc'
                    },
                    subtitle: {
                        color: '#94a3b8'
                    }
                }
            }
        },
        datatable: {
            colorScheme: {
                light: {
                    root: {
                        borderColor: '#e2e8f0'
                    },
                    row: {
                        background: '#ffffff',
                        hoverBackground: '#f8fafc',
                        color: '#1e293b'
                    }
                },
                dark: {
                    root: {
                        borderColor: '#475569'
                    },
                    row: {
                        background: '#1e293b',
                        hoverBackground: '#334155',
                        color: '#f8fafc'
                    }
                }
            },
            headerCell: {
                colorScheme: {
                    light: {
                        background: '#f8fafc',
                        color: '#1e293b',
                        borderColor: '#e2e8f0'
                    },
                    dark: {
                        background: '#334155',
                        color: '#f8fafc',
                        borderColor: '#475569'
                    }
                }
            },
            bodyCell: {
                colorScheme: {
                    light: {
                        borderColor: '#e2e8f0'
                    },
                    dark: {
                        borderColor: '#475569'
                    }
                }
            }
        }
    }
});

export default CedarStack;
