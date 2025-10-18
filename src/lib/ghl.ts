// GoHighLevel API Integration

interface GHLContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export async function createOrUpdateGHLContact(contact: GHLContact) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('GHL credentials not configured');
    return null;
  }

  try {
    const [firstName, ...lastNameParts] = (contact.firstName || '').split(' ');
    const lastName = lastNameParts.join(' ') || contact.lastName || '';

    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          email: contact.email,
          firstName: firstName || 'Unknown',
          lastName: lastName || '',
          phone: contact.phone || '',
          tags: contact.tags || [],
          customFields: contact.customFields || {},
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL API error:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('GHL contact created/updated:', data);
    return data;
  } catch (error) {
    console.error('Error sending to GHL:', error);
    return null;
  }
}

export async function addGHLTag(email: string, tag: string) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return null;
  }

  try {
    // First, find the contact by email
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('GHL search error:', await searchResponse.text());
      return null;
    }

    const searchData = await searchResponse.json();
    const contactId = searchData.contact?.id;

    if (!contactId) {
      console.warn('Contact not found in GHL:', email);
      return null;
    }

    // Get existing tags
    const contactResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
        },
      }
    );

    const contactData = await contactResponse.json();
    const existingTags = contactData.contact?.tags || [];

    // Add new tag to existing tags
    const updatedTags = [...new Set([...existingTags, tag])];

    // Update contact with new tags
    const updateResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          tags: updatedTags,
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('GHL update error:', await updateResponse.text());
      return null;
    }

    console.log('GHL tag added:', tag, 'to', email);
    return await updateResponse.json();
  } catch (error) {
    console.error('Error adding GHL tag:', error);
    return null;
  }
}
