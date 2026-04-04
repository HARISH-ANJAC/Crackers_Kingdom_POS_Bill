# ADMIN PORTAL - CRACKERS KINGDOM POS & BILLING

## SECTION 1: ADMIN MODULE DOCUMENTATION

# MODULE 1: AUTHENTICATION & DASHBOARD

## Screen 1.1: Login Screen
**Purpose**: User authentication and role-based access control.
**Components**:
- **Company Branding**: Display of "Crackers Kingdom" logo.
- **Identity Input**: Username (Email or Phone) field with descriptive icon.
- **Security Field**: Password input with visibility toggle (Show/Hide).
- **Session Control**: "Remember Me" checkbox for persistent login.
- **Primary Action**: Login button with interactive loading state.
- **Recovery**: "Forgot Password?" link for credential recovery.

**Field Definitions**:
- **Identity**: `Phone` or `Email` (String, Required, Unique).
- **Password**: Secure character string (Required).
- **Remember Me**: Boolean toggle (Optional).

**Business Logic & Actions**:
- **Authentication**: Verifies credentials against the backend database using secure JWT protocols.
- **Session Management**: On successful login, stores the access token and redirects the user based on their specific role permissions.

## Screen 1.2: Business Dashboard
**Purpose**: Real-time snapshot of business health and operational KPIs.
**Components**:
- **Key Statistics Cards**: Summarized views for Total Revenue, Orders, New Customers, and Active Product count.
- **Revenue Analytics**: Visual line chart showing daily or monthly revenue trends.
- **Inventory Distribution**: Pie chart visualizing product distribution across categories.
- **Activity Feed**: List of recent invoices and top-performing products.
- **Filters**: Date range selector to customize the dashboard view.

**Field Definitions**:
- **Stats**: Aggregate values calculated from transaction data.
- **Charts**: Visual representations of time-series and categorical data.

**Business Logic & Actions**:
- **Real-time Aggregation**: Fetches and computes business metrics directly from Sales and Inventory tables.
- **Drill-down**: Facilitates direct navigation to specific transaction records from the activity feed.

---

# MODULE 2: CATALOG & INVENTORY MANAGEMENT

## Screen 2.1: Category Management
**Purpose**: Organizing the product catalog into a manageable hierarchy.
**Components**:
- **Category Data Table**: Displays Banner Image, Category Name, Slug, and Display Order.
- **Search System**: Quick-filter by category name.
- **Manage Modal**: A comprehensive form to Add/Edit categories.
- **Bulk Actions**: Import/Export via CSV and Bulk Delete capabilities.

**Field Definitions**:
- **Category Image**: Display thumbnail for the storefront.
- **Category Name**: Public name of the category (e.g., "Sky Shots").
- **Slug**: URL-safe identifier (Unique).
- **Rank**: Numeric value determining the display order (Integer).
- **Status**: Binary toggle (Active/Inactive).

**Business Logic & Actions**:
- **SEO Optimization**: Automatically generates and validates unique slugs.
- **Dependency Tracking**: Prevents deletion of categories that contain active products.

## Screen 2.2: Product Master
**Purpose**: Centralized control over individual cracker details, pricing, and tax configurations.
**Components**:
- **Product Grid**: Detailed table showing Image, Category, MRP, Selling Price, and current Stock level.
- **Rich Filters**: Filter by Category, Tax (GST) inclusion, or Status.
- **Add/Edit Wizard**: Multi-field form for extensive product details.
- **Stock Adjustment**: Inline or modal-based stock increment/decrement.

**Field Definitions**:
- **Product Information**: Name, Detailed Description, and Multi-image gallery.
- **Pricing Strategy**: MRP and Selling Price (Numeric).
- **Tax Configuration**: GST percentage or inclusive/exclusive settings.
- **Identification**: SKU or uniquely generated Product Slugs.

**Business Logic & Actions**:
- **Margin Calculation**: Displays the discount percentage and profit margin relative to the Selling Price.
- **Inventory Sync**: Real-time updates to the stock count upon sales or manual adjustments.

## Screen 2.3: Units of Measure (UOM)
**Purpose**: Standardizing measurement units for packaging and sales.
**Components**:
- **UOM Table**: Name, Code (e.g., PCS, PKT), and Status.
- **Add/Edit Modal**: Simple form for creating new units.

**Field Definitions**:
- **Name**: Long name (e.g., "Pieces").
- **Code**: Short identifier (e.g., "PCS").

**Business Logic & Actions**:
- **Validation**: Ensures unique codes to maintain data consistency in shipping and billing.

## Screen 2.4: Product Tags
**Purpose**: Creating visual markers to highlight products (e.g., "Best Seller", "Eco-Friendly").
**Components**:
- **Tag Grid**: Name, Slug, Hex Color Code, and Status.
- **Color Picker**: Visual tool to select tag colors.

**Field Definitions**:
- **Tag Color**: CSS-compliant Hex code for UI rendering.

**Business Logic & Actions**:
- **Visual Branding**: Enables dynamic UI highlights in the customer storefront.

---

# MODULE 3: SALES & BILLING OPERATIONS

## Screen 3.1: Invoice Management (Billing History)
**Purpose**: Comprehensive audit and tracking of all generated invoices.
**Components**:
- **Revenue Stats**: Total Sales, Invoices generated, and total discounts given.
- **Search & Filter**: Search by Invoice ID or Customer Phone; Filter by Payment Method.
- **History Table**: Detailed list with download/share options (PDF).

**Field Definitions**:
- **Invoice ID**: Unique transaction identifier.
- **Customer Details**: Name and Phone linked to the record.
- **Payment Method**: Cash, UPI, or Card identifiers.

**Business Logic & Actions**:
- **Document Generation**: Generates official PDF receipts with branding and GST details.
- **Export Control**: Enables high-volume exports of sales data for accounting.

## Screen 3.2: Create New Bill (POS)
**Purpose**: High-speed point-of-sale interface for generating new cracker bills.
**Components**:
- **Smart Voice Billing**: Speech-to-text interface for adding items hands-free.
- **Customer CRM**: Real-time lookup of existing customers or quick-add for new ones.
- **Dynamic Cart**: Interactive list showing items, quantities, and sub-sums.
- **Adjustments Panel**: Controls for manual discounts, GST application, and notes.

**Field Definitions**:
- **Customer Profile**: Name, Phone, and optional Address.
- **Transaction Totals**: Sub-total, Tax, Final Amount.

**Business Logic & Actions**:
- **Inventory Locking**: Deducts items from stock immediately upon billing.
- **CRM Integration**: Automatically rewards or tracks customer purchase history based on Phone Number.

## Screen 3.3: Order (Enquiry) Management
**Purpose**: Managing customer enquiries and quotes before finalization.
**Components**:
- **Inquiry Pipeline**: List of pending vs. converted orders.
- **QR Operations**: Scan functionality to quickly convert enquiries into invoices.
- **Convert Action**: One-click workflow to finalize a quote.

**Field Definitions**:
- **Status**: (Enum: Pending, Confirmed, Converted, Cancelled).

**Business Logic & Actions**:
- **Workflow Conversion**: Seamlessly migrates order items into a new invoice while retaining historical inquiry data.

## Screen 3.4: Customer CRM
**Purpose**: Centralized database for managing customer information and purchase records.
**Components**:
- **Customer Table**: Displays Name, Phone (Unique ID), Email, and primary Address.
- **Stats Panel**: Count of New Customers, Total Customers, and contact availability.
- **Search & Filter**: Lookup customers by phone number or name.
- **Profile Modal**: Upsert form for customer contact details.

**Field Definitions**:
- **Name**: Customer Full Name (String).
- **Phone**: Primary contact and record key (String, Unique).
- **Address**: Billing and delivery location (Text).

**Business Logic & Actions**:
- **Persistence**: CRM data is auto-populated during the "Create Bill" flow for recurring customers.
- **Sales Intelligence**: Tracks historical orders per customer profile to identify high-value purchasers.

---

# MODULE 4: USER & ACCESS CONTROL

## Screen 4.1: User Management
**Purpose**: Managing administrative staff accounts and their system access levels.
**Components**:
- **Staff Table**: Displays Name, Email, Role, and Status.
- **Role Assignment**: Dropdown to select system roles (e.g., Admin, Cashier).
- **Invite System**: Sharing login invites via WhatsApp or Email.

**Field Definitions**:
- **Role**: Linked access level defining available screens.
- **Account Status**: Toggle to disable access instantly.

**Business Logic & Actions**:
- **Access Control**: Enforces strict role-based navigation and action restrictions.

## Screen 4.2: Roles & Permissions
**Purpose**: Configuring granular access rights for different system modules.
**Components**:
- **Permission Matrix**: Grid showing modules (e.g., Products, Billing) and actions (Read, Write, Create, Delete, Import, Export).
- **Toggle Switches**: Individual permission overrides.

**Field Definitions**:
- **Module Slug**: Unique identifier for system pages.
- **Action Type**: Specific permission level (Read/Write/Delete/etc).

**Business Logic & Actions**:
- **Dynamic ACL**: Injects role-based restrictions directly into the React Native state for real-time UI masking.

---

# MODULE 5: MARKETING & ASSET MANAGEMENT

## Screen 5.1: Banner Management
**Purpose**: Configuring hero carousels and promotional graphics for the web/app storefront.
**Components**:
- **Banner Banner Table**: Displays Title, Order (Rank), Badge text, and Status.
- **Upload Dropzone**: Image picker for high-resolution graphics.
- **CTA Configurator**: Input for "Call to Action" text and internal routing links.

**Field Definitions**:
- **Badge**: Promotional text highlight (e.g., "50% OFF").
- **Rank**: Display order index (Integer).
- **CTA Link**: Deep-link to product or category page.

**Business Logic & Actions**:
- **Marketing Agility**: Allows instant updates to storefront seasonal themes without code changes.

## Screen 5.2: Upload Asset Library
**Purpose**: Centralized interface for managing all server-side images, PDFs, and video files.
**Components**:
- **Asset Browser**: Filter by file type (CategoryImage, ProductImage, Video).
- **Preview Thumbnail**: Visual representation of the asset.
- **Link Tracker**: Displays which Product or Category a file is currently linked to.

**Field Definitions**:
- **File Name**: Original name of the uploaded asset.
- **Relative Path**: Server-side storage path for frontend retrieval.

**Business Logic & Actions**:
- **Integrity Check**: Prevents deletion of assets that are actively linked to products or categories to avoid broken UI.
- **Bulk Upload**: Supports multi-file selection and high-speed upload processing.

## Screen 5.3: Video Gallery
**Purpose**: Managing promotional media and product unboxing videos to enhance product pages.
**Components**:
- **Video List**: Previews of uploaded videos or external stream links.
- **Source Selection**: Switch between Local File Upload and YouTube Link.
- **Product Mapping**: Dropdown to associate a video with a specific system product.
- **Preview Modal**: Integrated player to verify video playback within the admin portal.

**Field Definitions**:
- **Video Type**: (Enum: Upload, YouTube).
- **URL**: Direct server path or YouTube video ID.

**Business Logic & Actions**:
- **Engagement**: Associates visual media with products to drive higher customer conversion in the storefront.

---

# MODULE 6: SYSTEM UTILITIES & CONFIGURATION

## Screen 6.1: Shop Settings (Identity)
**Purpose**: Global configuration for shop branding and tax identity.
**Components**:
- **Branding Form**: Fields for Shop Name, phone, and branding Address.
- **Tax Settings**: Input for Shop GST and other legal identifiers.

**Field Definitions**:
- **Shop Name**: Primary name used on all invoices.
- **Shop GST**: Validated tax ID for fiscal compliance.

**Business Logic & Actions**:
- **Fiscal Compliance**: Updates the GST and address info across all generated PDF invoices in real-time.

## SECTION 2: COMMON COMPONENTS & UI STANDARDS

Consistent design patterns applied across the Admin Portal ensure a professional and cohesive user experience:

### 2.1 Toast Messaging (Notifications)
Feedback is provided using a "react-hot-toast" inspired notification system:
- **Success**: Green theme with checkmark icon for successful operations (e.g., "Product added successfully").
- **Error**: Red theme with alert icon for failures (e.g., "Failed to save category").
- **Warning**: Amber theme for cautionary messages (e.g., "Stock is critically low").
- **Info**: Blue theme for general system updates or information.

### 2.2 Data Grid (DataTable)
A robust and interactive table system used for managing all major data entities:
- **Pagination Controls**: 
    - Numeric page buttons (e.g., `1`, `2`, `3`, `...`, `10`) for direct navigation.
    - Previous and Next arrow buttons.
    - **Records Per Page**: Selectable dropdown to show `5`, `10`, `25`, `50`, or `ALL` records at once.
- **Bulk Record Management**:
    - **Selection**: A Master Checkbox in the header to select all visible records, plus individual checkboxes per row.
    - **Bulk Delete**: A persistent "Delete Selection" button appears when records are selected, triggering the `DeleteConfirmModal`.
- **Search & Filtering**:
    - **Universal Search**: A top-level search bar to filter records across multiple text fields (Name, Phone, ID).
    - **Status Filter**: A dedicated dropdown to toggle between `All`, `Active`, and `Inactive` records.

### 2.3 Status & Enum Badges
Visual indicators used to signify states and categories with a premium aesthetic:
- **Record Status Badges**:
    - **Active**: Green background with dark green text (e.g., `● Active`).
    - **Inactive**: Red background with dark red text (e.g., `● Inactive`).
- **Payment Method Badges**:
    - **Cash**: Emerald Green theme.
    - **UPI**: Indigo Blue theme.
    - **Card**: Violet Purple theme.
- **Order Status Badges**:
    - **Pending**: Orange theme (Warning).
    - **Confirmed**: Sky Blue theme (Info).
    - **Converted**: Forest Green theme (Success).
    - **Cancelled**: Slate Gray theme (Secondary).
- **Video Type Badges**:
    - **Upload**: Teal theme (Local).
    - **YouTube**: Red theme (External).

### 2.4 DeleteConfirmModal
A standardized safety mechanism for destructive operations:
- **Purpose**: Prevent accidental deletions.
- **Functionality**:
    - Displays a summary of the item(s) being deleted (e.g., "Are you sure you want to delete 5 items?").
    - **Action Buttons**: A "Cancel" button and a high-visibility "Delete" button.
    - **Process**: Triggers the individual or bulk API delete call upon confirmation.

---

## SECTION 3: SERVER DATABASE SCHEMA ANALYSIS

The system is powered by a **PostgreSQL** database using **Drizzle ORM** for schema definition and type safety.

### 3.1 Core Architecture Patterns
- **UUIDs**: All primary keys utilize randomly generated UUIDs for security and scalability.
- **Historical Snapshotting**: Invoice and Order tables store a text-based "snapshot" of product names and descriptions at the time of transaction. This ensures that changing a product's name in the future does not alter previous invoices.
- **Relationship Integrity**: Uses `CASCADE` for secondary data (like tags) and `RESTRICT` for critical entities (like customers or products) to prevent accidental data loss.

### 3.2 Data Entities & Relationships

| Module | Principal Table | Key Relationships | Purpose |
| :--- | :--- | :--- | :--- |
| **Auth** | `users` | `roles` | Manages staff accounts and login credentials. |
| **Permissions** | `role_permissions` | `modules`, `permission_actions` | Maps specific actions (Read/Write) to User Roles. |
| **Catalog** | `products` | `category`, `uoms` | The central catalog with pricing and metadata. |
| **Inventory** | `product_stocks` | `products` | Tracks current quantity with 1-to-1 mapping to products. |
| **CRM** | `customers` | N/A | Central database of purchasers identified by Phone number. |
| **Sales** | `invoices` | `customers`, `users` | Final legal receipts with payment method tracking. |
| **Inquiry** | `orders` | `customers`, `users` | Pre-sale enquiry tracking with conversion logic to Invoices. |
| **CMS** | `banners` | N/A | Marketing assets for the web/app storefront carousel. |
| **Media** | `videos` | `products` | Rich media (YouTube/Upload) linked to specific crackers. |

### 3.3 Status & Enumerations (Enums)
- **`payment_method`**: (cash, upi, card).
- **`order_status`**: (pending, confirmed, converted, cancelled).
- **`video_type`**: (upload, youtube).

### 3.4 Operational Timestamps
Every table implements `created_at` and `updated_at` timestamps for detailed auditing and synchronization tracking.
